"""Grade: fused softmax kernel in Triton.

Contract — harness/solutions/softmax_triton.py:

    def softmax(x) -> Tensor:
        '''x: (rows, cols) float32 CUDA tensor. Row-wise softmax computed by a
        Triton kernel you wrote (one program per row is the classic scheme).
        No torch.softmax inside — the grader also checks it beats eager torch
        composed ops, which torch.softmax wouldn't reliably do anyway.'''

Checks: correctness across shapes (incl. non-power-of-2 cols and a
stability case), and median runtime within 1.25x of torch.softmax on
(4096, 4096).
"""

import torch

from .common import bench, check, load_solution, require_cuda


def grade():
    checks, metrics = [], {}
    require_cuda()
    fn, found = load_solution("softmax_triton", "softmax")
    checks.append(found)
    if fn is None:
        return checks, metrics

    torch.manual_seed(0)
    max_err = 0.0
    for name, rows, cols, scale in [
        ("basic", 512, 1024, 1.0),
        ("odd-cols", 128, 1000, 1.0),
        ("stability", 64, 2048, 50.0),
    ]:
        x = torch.randn(rows, cols, device="cuda") * scale
        ref = torch.softmax(x, dim=-1)
        try:
            out = fn(x)
        except Exception as e:
            checks.append(check(name, False, f"raised {type(e).__name__}: {e}"))
            continue
        err = (out - ref).abs().max().item()
        max_err = max(max_err, err)
        checks.append(check(name, err <= 1e-5, f"max abs error {err:.2e} (tolerance 1e-5)"))

    x = torch.randn(4096, 4096, device="cuda")
    yours = bench(lambda: fn(x))
    torchs = bench(lambda: torch.softmax(x, dim=-1))
    ratio = yours / torchs
    metrics["max_abs_err"] = max_err
    metrics["time_ratio_vs_torch"] = round(ratio, 3)
    metrics["your_us"] = round(yours * 1e6, 1)
    metrics["torch_us"] = round(torchs * 1e6, 1)
    checks.append(check(
        "performance", ratio <= 1.25,
        f"your kernel {yours * 1e6:.0f}us vs torch.softmax {torchs * 1e6:.0f}us on (4096,4096) "
        f"— ratio {ratio:.2f} (must be <= 1.25)",
    ))
    return checks, metrics
