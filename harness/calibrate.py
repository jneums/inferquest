#!/usr/bin/env python3
"""Calibrate training-grader pass bands with multi-seed reference runs.

    python harness/calibrate.py --task first-convergence --seeds 20
    python harness/calibrate.py --task adapter-lift --seeds 20

Runs the harness's reference implementation N times with different data
seeds on this machine and prints the metric distribution plus a suggested
band (mean + max(5*sigma, 0.05), rounded up). Run on each distinct GPU
class in the fleet; ship the worst (highest) suggestion. CPU works (slow).
"""

import argparse
import copy
import math
import statistics
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

import torch  # noqa: E402
import torch.nn as nn  # noqa: E402
import torch.nn.functional as F  # noqa: E402

from graders import traindata  # noqa: E402


def reference_adapter(model, batches, rank=8, lr=1e-2, warmup=8, total=traindata.ADAPT_STEPS):
    """Reference LoRA: adapters on every 2D weight (linears AND embeddings —
    the “all layers” lesson), B zero-init, hotter-than-full-FT LR, and 50/50
    language-A rehearsal via traindata.replay_batches (without it, A collapses)."""
    import torch.nn.utils.parametrize as parametrize

    class LoRA(nn.Module):
        def __init__(self, out_f, in_f):
            super().__init__()
            self.A = nn.Parameter(torch.randn(rank, in_f) * 0.01)
            self.B = nn.Parameter(torch.zeros(out_f, rank))

        def forward(self, w):
            return w + self.B @ self.A

    targets = [
        (name, mod)
        for name, mod in model.named_modules()
        if isinstance(mod, (nn.Linear, nn.Embedding))
    ]
    loras = {}
    for name, mod in targets:
        w = mod.weight
        lora = LoRA(w.shape[0], w.shape[1]).to(w.device)
        parametrize.register_parametrization(mod, "weight", lora)
        loras[f"{name}.weight"] = lora

    opt = torch.optim.AdamW(
        [p for lora in loras.values() for p in lora.parameters()], lr=lr, weight_decay=0.0
    )
    device = next(model.parameters()).device
    replay = traindata.replay_batches(device=device, steps=total)
    step = 0
    for (x, y), (xa, ya) in zip(batches, replay):
        frac = min(1.0, (step + 1) / warmup)
        cos = 0.5 * (1 + math.cos(math.pi * step / max(1, total)))
        for pg in opt.param_groups:
            pg["lr"] = lr * frac * (0.1 + 0.9 * cos)
        logits_b = model(x)
        logits_a = model(xa)
        loss = 0.5 * F.cross_entropy(logits_b.view(-1, logits_b.size(-1)), y.view(-1)) \
             + 0.5 * F.cross_entropy(logits_a.view(-1, logits_a.size(-1)), ya.view(-1))
        opt.zero_grad(set_to_none=True)
        loss.backward()
        torch.nn.utils.clip_grad_norm_(
            [p for lora in loras.values() for p in lora.parameters()], 1.0
        )
        opt.step()
        step += 1

    adapter = {n: (l.A.detach().clone(), l.B.detach().clone()) for n, l in loras.items()}
    for name, mod in targets:
        parametrize.remove_parametrizations(mod, "weight", leave_parametrized=False)
    return adapter


def suggest(losses):
    mean = statistics.mean(losses)
    sigma = statistics.stdev(losses) if len(losses) > 1 else 0.0
    band = math.ceil((mean + max(5 * sigma, 0.05)) * 100) / 100
    print(f"\nmean {mean:.4f}  sigma {sigma:.4f}  min {min(losses):.4f}  max {max(losses):.4f}",
          file=sys.stderr)
    return band


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--task", default="first-convergence",
                    choices=["first-convergence", "adapter-lift"])
    ap.add_argument("--seeds", type=int, default=20, help="number of reference runs")
    args = ap.parse_args()

    device = "cuda" if torch.cuda.is_available() else "cpu"
    name = torch.cuda.get_device_name(0) if device == "cuda" else "cpu"
    print(f"device: {name} | torch {torch.__version__} | task {args.task} | {args.seeds} runs",
          file=sys.stderr)

    if args.task == "first-convergence":
        losses = []
        for s in range(args.seeds):
            seed = traindata.DATA_SEED + s
            model = traindata.TrainGPT().to(device)
            t0 = time.perf_counter()
            traindata.reference_train(model, traindata.train_batches(device=device, seed=seed))
            vl = traindata.val_loss(model, device=device, seed=seed)
            losses.append(vl)
            print(f"  seed {seed:3d}: val_loss {vl:.4f}  ({time.perf_counter() - t0:.1f}s)",
                  file=sys.stderr)
        band = suggest(losses)
        print(f"suggested VAL_LOSS_BAND: {band}", file=sys.stderr)
        print(f"entropy floor of the corpus: {traindata.entropy_floor():.4f}", file=sys.stderr)
        print(band)
        return

    # adapter-lift: one deterministic base, N adaptation runs over seeds
    from graders.adapter_lift import build_base

    base = build_base(device)
    a_before = traindata.val_loss(base, device=device)
    b_before = traindata.val_loss_b(base, device=device)
    print(f"base: language A {a_before:.4f} | language B {b_before:.4f}", file=sys.stderr)

    b_afters, regressions = [], []
    for s in range(args.seeds):
        seed = traindata.DATA_SEED + s
        model = copy.deepcopy(base)
        t0 = time.perf_counter()
        adapter = reference_adapter(model, traindata.adapt_batches(device=device, seed=seed))
        model = copy.deepcopy(base)
        with torch.no_grad():
            params = dict(model.named_parameters())
            for n, (a, b) in adapter.items():
                params[n].add_(b.to(params[n].device) @ a.to(params[n].device))
        b_after = traindata.val_loss_b(model, device=device, seed=seed)
        regress = max(0.0, traindata.val_loss(model, device=device) - a_before)
        b_afters.append(b_after)
        regressions.append(regress)
        print(f"  seed {seed:3d}: B {b_before:.4f} -> {b_after:.4f}  regressA {regress:.4f}  "
              f"({time.perf_counter() - t0:.1f}s)", file=sys.stderr)

    band = suggest(b_afters)
    print(f"suggested VAL_B_BAND: {band}", file=sys.stderr)
    print(f"regression: max {max(regressions):.4f} (tolerance in grader: 0.10)", file=sys.stderr)
    print(band)


if __name__ == "__main__":
    main()
