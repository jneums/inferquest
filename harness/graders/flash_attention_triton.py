"""Grade: simplified flash attention (forward only) in Triton.

Contract — harness/solutions/flash_attention.py:

    def flash_attention(q, k, v) -> Tensor:
        '''q, k, v: (batch, heads, seq, head_dim) float32 CUDA tensors.
        Causal attention, computed tile-by-tile with online softmax — never
        materializing the (seq, seq) score matrix. Forward pass only.'''

Checks: correctness vs SDPA, an 8192-seq run that a materialized (seq,seq)
approach would need ~2GB+ of scores for, and >= 1.5x speedup over naive
materialized attention at seq 4096.
"""

import torch
import torch.nn.functional as F

from .common import bench, check, load_solution, require_cuda


def naive_attention(q, k, v):
    import math

    s = (q @ k.transpose(-2, -1)) / math.sqrt(k.size(-1))
    t = q.size(-2)
    mask = torch.tril(torch.ones(t, t, device=q.device, dtype=torch.bool))
    s = s.masked_fill(~mask, float("-inf"))
    return torch.softmax(s, dim=-1) @ v


def grade():
    checks, metrics = [], {}
    require_cuda()
    fn, found = load_solution("flash_attention", "flash_attention")
    checks.append(found)
    if fn is None:
        return checks, metrics

    torch.manual_seed(0)
    max_err = 0.0
    for name, b, h, s, d in [("small", 1, 4, 256, 64), ("mid", 2, 8, 1024, 64)]:
        q, k, v = (torch.randn(b, h, s, d, device="cuda") for _ in range(3))
        ref = F.scaled_dot_product_attention(q, k, v, is_causal=True)
        try:
            out = fn(q, k, v)
        except Exception as e:
            checks.append(check(name, False, f"raised {type(e).__name__}: {e}"))
            continue
        err = (out - ref).abs().max().item()
        max_err = max(max_err, err)
        checks.append(check(name, err <= 2e-2, f"max abs error {err:.2e} (tolerance 2e-2)"))

    try:
        q, k, v = (torch.randn(1, 2, 8192, 64, device="cuda") for _ in range(3))
        ref = F.scaled_dot_product_attention(q, k, v, is_causal=True)
        err = (fn(q, k, v) - ref).abs().max().item()
        max_err = max(max_err, err)
        checks.append(check("long-seq-8192", err <= 2e-2, f"max abs error {err:.2e} at seq 8192"))
    except torch.cuda.OutOfMemoryError:
        checks.append(check("long-seq-8192", False, "OOM at seq 8192 — are you materializing the score matrix?"))

    q, k, v = (torch.randn(1, 8, 4096, 64, device="cuda") for _ in range(3))
    yours = bench(lambda: fn(q, k, v))
    naive = bench(lambda: naive_attention(q, k, v))
    speedup = naive / yours
    metrics["max_abs_err"] = max_err
    metrics["speedup_vs_naive"] = round(speedup, 2)
    metrics["your_ms"] = round(yours * 1e3, 2)
    metrics["naive_ms"] = round(naive * 1e3, 2)
    checks.append(check(
        "performance", speedup >= 1.5,
        f"{yours * 1e3:.1f}ms vs naive {naive * 1e3:.1f}ms at seq 4096 — {speedup:.1f}x (need >= 1.5x)",
    ))
    return checks, metrics
