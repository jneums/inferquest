"""Grade: scaled dot-product attention from scratch.

Contract — harness/solutions/attention.py:

    def attention(q, k, v, causal: bool = False) -> Tensor:
        '''q, k, v: (batch, heads, seq, head_dim) float32 tensors.
        Return attention output, same shape. No torch.nn.functional.scaled_dot_product_attention,
        no einops attention helpers — build it from matmul + softmax.'''

Checked against torch SDPA on CPU or GPU, causal and non-causal, plus a
numerical-stability case with large logits.
"""

import torch
import torch.nn.functional as F

from .common import check, load_solution


def grade():
    checks, metrics = [], {}
    fn, found = load_solution("attention", "attention")
    checks.append(found)
    if fn is None:
        return checks, metrics

    device = "cuda" if torch.cuda.is_available() else "cpu"
    torch.manual_seed(0)
    max_err = 0.0

    cases = [
        ("basic", 2, 4, 64, 32, False, 1.0),
        ("causal", 2, 4, 128, 64, True, 1.0),
        ("stability (large logits)", 1, 2, 64, 32, False, 30.0),
    ]
    for name, b, h, s, d, causal, scale_up in cases:
        q = torch.randn(b, h, s, d, device=device) * scale_up
        k = torch.randn(b, h, s, d, device=device) * scale_up
        v = torch.randn(b, h, s, d, device=device)
        ref = F.scaled_dot_product_attention(q, k, v, is_causal=causal)
        try:
            out = fn(q, k, v, causal=causal)
        except Exception as e:
            checks.append(check(name, False, f"raised {type(e).__name__}: {e}"))
            continue
        if out is None or out.shape != ref.shape:
            checks.append(check(name, False, f"expected shape {tuple(ref.shape)}, got {None if out is None else tuple(out.shape)}"))
            continue
        err = (out - ref).abs().max().item()
        max_err = max(max_err, err)
        checks.append(check(name, err <= 1e-3, f"max abs error {err:.2e} (tolerance 1e-3)"))

    metrics["max_abs_err"] = max_err
    return checks, metrics
