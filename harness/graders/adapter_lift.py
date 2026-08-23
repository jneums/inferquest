"""Grade: adapter lift — a rank-capped LoRA that learns language B without
forgetting language A.

The harness builds its OWN base model deterministically (the first-convergence
workload: reference AdamW on language A, identical on every device), then
hands it to you frozen alongside a fixed budget of "language B" — the same
Markov family on 8 NEW tokens the base has never seen — like teaching a
model new special tokens or domain jargon, and sized to the rank cap so a
rank-8 adapter can represent the new rows exactly. A and B never conflict,
so forgetting is purely an optimization artifact — exactly what disciplined
adapter training avoids. You return a LoRA adapter; the harness applies it
to ITS base and measures both languages. Structurally cheat-resistant: a
rank-8 delta can't smuggle in a different model, and the base never leaves
the harness's hands.

Contract — harness/solutions/adapter_lift.py:

    def train_adapter(model, batches):
        # model:   frozen TrainGPT base (requires_grad=False), on device,
        #          already trained on language A by the harness
        # batches: generator of exactly 64 (x, y) language-B pairs on device
        #          — (32, 128) each, ~262k tokens. One pass; this IS the budget.
        # Return {param_name: (A, B)} for any 2D weights you target, where
        #   A: (r, in_features), B: (out_features, r), r <= 8.
        # The harness adds B @ A to that weight (bake any alpha/r scaling in).
        # Train it LoRA-style (nn.utils.parametrize is your friend), or full
        # fine-tune a copy and SVD-truncate the delta — both are legitimate
        # low-rank methods. Names come from model.named_parameters().

The two lessons, learned the hard way if you skip them: (1) REHEARSAL —
train on B alone and language A collapses; graders.traindata.replay_batches
hands you fresh language-A text to mix in, and using it is the intended
technique, not a loophole. (2) LEARNING RATE — adapter LRs run hotter than
full-FT LRs, but push too hot and A collapses even with rehearsal.

Checks: adapter is genuinely rank<=8 on real weights, val loss on language B
reaches the calibrated band, and language A regresses by at most 0.10.
"""

import torch

from .common import check, load_solution
from . import traindata


RANK_MAX = 8
# Calibrated: 20-seed reference runs (harness/calibrate.py --task
# adapter-lift, RTX Pro 6000): language-B val loss mean 1.7441, sigma
# 0.0182, max regression 0.0267 — band = mean + max(5*sigma, 0.05),
# rounded up. Corpus entropy floor ~1.698.
VAL_B_BAND = 1.84
REGRESS_TOL = 0.10


def build_base(device):
    model = traindata.TrainGPT().to(device)
    traindata.reference_train(model, traindata.train_batches(device=device))
    for p in model.parameters():
        p.requires_grad_(False)
    return model


def validate_adapter(model, adapter):
    """Returns (ok_check, list of (param, delta)) — validation must pass
    before anything touches the base weights."""
    if not isinstance(adapter, dict) or not adapter:
        return check("adapter-valid", False, "return a non-empty dict {param_name: (A, B)}"), []
    params = dict(model.named_parameters())
    deltas = []
    for name, pair in adapter.items():
        if name not in params:
            return check("adapter-valid", False, f"unknown parameter '{name}'"), []
        w = params[name]
        if w.dim() != 2:
            return check("adapter-valid", False, f"'{name}' is not a 2D weight"), []
        try:
            a, b = pair
        except Exception:
            return check("adapter-valid", False, f"'{name}': expected an (A, B) pair"), []
        if not (torch.is_tensor(a) and torch.is_tensor(b)):
            return check("adapter-valid", False, f"'{name}': A and B must be tensors"), []
        a, b = a.detach().to(w.device, torch.float32), b.detach().to(w.device, torch.float32)
        r = a.shape[0]
        if b.dim() != 2 or a.dim() != 2 or b.shape[1] != r:
            return check("adapter-valid", False, f"'{name}': A must be (r, in), B (out, r)"), []
        if r > RANK_MAX:
            return check("adapter-valid", False, f"'{name}': rank {r} > cap {RANK_MAX}"), []
        if a.shape[1] != w.shape[1] or b.shape[0] != w.shape[0]:
            return check(
                "adapter-valid", False,
                f"'{name}': (B@A) shape ({b.shape[0]},{a.shape[1]}) != weight {tuple(w.shape)}",
            ), []
        delta = b @ a
        if not torch.isfinite(delta).all():
            return check("adapter-valid", False, f"'{name}': non-finite values"), []
        deltas.append((w, delta))
    n = sum(a.numel() + b.numel() for a, b in (map(torch.as_tensor, p) for p in adapter.values()))
    return check(
        "adapter-valid", True,
        f"{len(deltas)} weights adapted, rank <= {RANK_MAX}, {n:,} adapter params",
    ), deltas


def grade():
    checks, metrics = [], {}
    fn, found = load_solution("adapter_lift", "train_adapter")
    checks.append(found)
    if fn is None:
        return checks, metrics

    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = build_base(device)

    loss_a_before = traindata.val_loss(model, device=device)
    loss_b_before = traindata.val_loss_b(model, device=device)
    checks.append(check(
        "base-built", 1.8 < loss_a_before < 2.1,
        f"harness base: language A {loss_a_before:.4f}, language B {loss_b_before:.4f} before adaptation",
    ))
    base_snapshot = {k: v.detach().clone() for k, v in model.state_dict().items()}

    try:
        adapter = fn(model, traindata.adapt_batches(device=device))
    except Exception as e:
        checks.append(check("train-adapter", False, f"raised {type(e).__name__}: {e}"))
        return checks, metrics

    # The base must come back untouched — the adapter is the only delta.
    model.load_state_dict(base_snapshot)
    for p in model.parameters():
        p.requires_grad_(False)

    ok, deltas = validate_adapter(model, adapter)
    checks.append(ok)
    if not ok["passed"]:
        return checks, metrics

    with torch.no_grad():
        for w, delta in deltas:
            w.add_(delta)

    loss_a_after = traindata.val_loss(model, device=device)
    loss_b_after = traindata.val_loss_b(model, device=device)
    regression = max(0.0, loss_a_after - loss_a_before)
    metrics["val_loss_b"] = round(loss_b_after, 4)
    metrics["val_loss_b_before"] = round(loss_b_before, 4)
    metrics["lift"] = round(loss_b_before - loss_b_after, 4)
    metrics["regression"] = round(regression, 4)
    metrics["val_loss_a"] = round(loss_a_after, 4)

    if VAL_B_BAND is None:
        checks.append(check(
            "language-b-band", False,
            f"language B {loss_b_before:.4f} -> {loss_b_after:.4f} — band not yet calibrated "
            "(harness/calibrate.py --task adapter-lift)",
        ))
    else:
        checks.append(check(
            "language-b-band", loss_b_after <= VAL_B_BAND,
            f"language B val loss {loss_b_before:.4f} -> {loss_b_after:.4f} (band: <= {VAL_B_BAND})",
        ))
    checks.append(check(
        "no-forgetting", regression <= REGRESS_TOL,
        f"language A val loss {loss_a_before:.4f} -> {loss_a_after:.4f} "
        f"(regression {regression:.4f}, tolerance {REGRESS_TOL})",
    ))
    return checks, metrics
