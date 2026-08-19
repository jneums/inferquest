"""Grade: group-wise 4-bit weight quantization from scratch.

Contract — harness/solutions/quantizer.py:

    def quantize(w, bits: int = 4, group_size: int = 128):
        '''w: (out, in) float32 weight tensor. Asymmetric uniform quantization
        with one scale and zero-point PER GROUP of `group_size` consecutive
        input-dim values. Return (q, scales, zeros) where q is an integer
        tensor in [0, 2**bits - 1] with w's shape.'''

    def dequantize(q, scales, zeros) -> Tensor:
        '''Reconstruct float32 weights.'''

Graded on: quantized-range validity, reconstruction error that BEATS the
grader's own per-tensor baseline by >= 4x (the whole point of grouping —
computed on weights with realistic outliers), and end-to-end sanity: quantize
every linear weight in the reference MiniGPT and keep logit error bounded.

No torch.quantization / quanto / bitsandbytes — build it from rounding and
clamping.
"""

import torch

from .common import check, load_solution
from .minigpt import MiniGPT


def per_tensor_baseline(w, bits=4):
    lo, hi = w.min(), w.max()
    scale = (hi - lo) / (2**bits - 1)
    q = ((w - lo) / scale).round().clamp(0, 2**bits - 1)
    return q * scale + lo


def grade():
    checks, metrics = [], {}
    quantize, found_q = load_solution("quantizer", "quantize")
    checks.append(found_q)
    if quantize is None:
        return checks, metrics
    import importlib

    dequantize = getattr(importlib.import_module("solutions.quantizer"), "dequantize", None)
    if dequantize is None:
        checks.append(check("solution-found", False, "solutions/quantizer.py has no `dequantize`."))
        return checks, metrics

    torch.manual_seed(3)
    # Realistic weights: gaussian bulk + concentrated per-channel outliers
    # (what makes per-tensor quantization fall apart and grouping matter).
    w = torch.randn(512, 1024)
    w[:, :16] *= 12.0  # outlier channels, confined to the first group

    try:
        q, scales, zeros = quantize(w.clone(), 4, 128)
        recon = dequantize(q, scales, zeros)
    except Exception as e:
        checks.append(check("quantize", False, f"raised {type(e).__name__}: {e}"))
        return checks, metrics

    range_ok = (
        recon.shape == w.shape
        and torch.all(q >= 0)
        and torch.all(q <= 15)
        and torch.allclose(q, q.round())
    )
    checks.append(check(
        "valid-4bit", range_ok,
        "q integral in [0, 15], shapes preserved" if range_ok else "q must be integral values in [0, 15] with w's shape",
    ))

    err = (recon - w).pow(2).mean().sqrt().item()
    base_err = (per_tensor_baseline(w) - w).pow(2).mean().sqrt().item()
    ratio = base_err / max(err, 1e-12)
    metrics["rms_error"] = round(err, 6)
    metrics["per_tensor_rms_error"] = round(base_err, 6)
    metrics["improvement_over_per_tensor"] = round(ratio, 2)
    checks.append(check(
        "beats-per-tensor", ratio >= 3.0,
        f"group-wise RMS error {err:.4f} vs per-tensor baseline {base_err:.4f} — {ratio:.1f}x better (need >= 3x; outlier columns are why)",
    ))

    # End-to-end: quantize every linear in MiniGPT, bound the logit damage.
    model = MiniGPT().eval()
    ids = torch.randint(0, model.config["vocab_size"], (1, 48))
    with torch.no_grad():
        ref_logits = model(ids)[0, -1, :]
        for name, p in model.named_parameters():
            if p.dim() == 2 and "emb" not in name:
                q, s, z = quantize(p.data.clone(), 4, 128)
                p.data = dequantize(q, s, z)
        quant_logits = model(ids)[0, -1, :]
    top1_same = int(ref_logits.argmax()) == int(quant_logits.argmax())
    logit_rmse = (quant_logits - ref_logits).pow(2).mean().sqrt().item()
    metrics["logit_rmse"] = round(logit_rmse, 4)
    checks.append(check(
        "end-to-end", top1_same and logit_rmse < 1.0,
        f"W4 MiniGPT: top-1 prediction {'preserved' if top1_same else 'CHANGED'}, logit RMSE {logit_rmse:.3f} (need same top-1 and RMSE < 1.0)",
    ))
    return checks, metrics
