"""Grade: tiled matmul kernel (CUDA C++ via load_inline, or Triton — your choice).

Contract — harness/solutions/matmul.py:

    def matmul(a, b) -> Tensor:
        '''a: (M, K), b: (K, N) float32 CUDA tensors -> (M, N).
        Must launch YOUR kernel (CUDA C++ through torch.utils.cpp_extension
        or Triton). Calling torch.matmul/cuBLAS inside is self-defeating and
        the fraction-of-cuBLAS metric would read ~1.0 — reviewers know what
        that means on a hand-rolled kernel task.'''

Checks: correctness on square and rectangular shapes, and >= 40% of cuBLAS
throughput on 4096^3 FP32 — the classic shared-memory tiling target.
"""

import torch

from .common import bench, check, load_solution, require_cuda


def grade():
    checks, metrics = [], {}
    require_cuda()
    fn, found = load_solution("matmul", "matmul")
    checks.append(found)
    if fn is None:
        return checks, metrics

    torch.manual_seed(0)
    for name, m, k, n in [("square", 512, 512, 512), ("rect", 384, 1024, 768)]:
        a = torch.randn(m, k, device="cuda")
        b = torch.randn(k, n, device="cuda")
        ref = a @ b
        try:
            out = fn(a, b)
        except Exception as e:
            checks.append(check(name, False, f"raised {type(e).__name__}: {e}"))
            continue
        err = (out - ref).abs().max().item()
        checks.append(check(name, err <= 5e-2, f"max abs error {err:.2e} (tolerance 5e-2 fp32 accumulation)"))

    size = 4096
    a = torch.randn(size, size, device="cuda")
    b = torch.randn(size, size, device="cuda")
    yours = bench(lambda: fn(a, b), warmup=3, iters=8)
    cublas = bench(lambda: a @ b, warmup=3, iters=8)
    flops = 2 * size**3
    your_tflops = flops / yours / 1e12
    cublas_tflops = flops / cublas / 1e12
    frac = your_tflops / cublas_tflops
    metrics["your_tflops"] = round(your_tflops, 2)
    metrics["cublas_tflops"] = round(cublas_tflops, 2)
    metrics["frac_of_cublas"] = round(frac, 3)
    checks.append(check(
        "performance", frac >= 0.4,
        f"{your_tflops:.1f} TFLOPS vs cuBLAS {cublas_tflops:.1f} on {size}^3 fp32 "
        f"— {frac * 100:.0f}% of cuBLAS (need >= 40%)",
    ))
    return checks, metrics
