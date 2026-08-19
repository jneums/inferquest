"""Shared grading utilities."""

import importlib
import time


def check(name, passed, detail):
    return {"name": name, "passed": bool(passed), "detail": str(detail)}


def load_solution(module_name, attr):
    """Import the user's solution, returning (callable_or_None, error_check)."""
    try:
        mod = importlib.import_module(f"solutions.{module_name}")
    except ImportError as e:
        return None, check(
            "solution-found",
            False,
            f"Could not import harness/solutions/{module_name}.py ({e}). "
            f"Create it per the task contract.",
        )
    fn = getattr(mod, attr, None)
    if fn is None:
        return None, check(
            "solution-found", False, f"solutions/{module_name}.py has no `{attr}`."
        )
    return fn, check("solution-found", True, f"solutions/{module_name}.py::{attr}")


def require_cuda():
    import torch

    if not torch.cuda.is_available():
        raise RuntimeError("This grader needs a CUDA GPU (torch.cuda.is_available() is False).")
    return torch


def bench(fn, warmup=3, iters=10):
    """Median wall time of a CUDA-synchronized callable, in seconds."""
    import torch

    for _ in range(warmup):
        fn()
    torch.cuda.synchronize()
    times = []
    for _ in range(iters):
        t0 = time.perf_counter()
        fn()
        torch.cuda.synchronize()
        times.append(time.perf_counter() - t0)
    times.sort()
    return times[len(times) // 2]
