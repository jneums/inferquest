"""Grade: make training measurably faster — loss-matched, same device.

The harness trains its own plain baseline (eager fp32 AdamW, graders/
traindata.py::reference_train) on a fixed ~25M-param, 3.1M-token workload,
then trains an identically-initialized model with YOUR loop on the same
token budget. Everything is relative to your own hardware — no absolute
times. Requires a CUDA GPU (the workload is sized so a fast card still has
tens of seconds of baseline to cut into).

Contract — harness/solutions/train_speedup.py:

    def prepare(model):          # OPTIONAL, untimed
        # One-time setup: torch.compile the model, warm up kernels with
        # dummy batches you fabricate, pick precision. Return the (possibly
        # wrapped) model to train, or None to keep the original.
        # NOTE: torch.compile needs a C compiler in your environment
        # (`apt install gcc g++` on bare pytorch/pytorch docker images).

    def train(model, batches):   # TIMED
        # model:   TrainGPT(SPEED_CONFIG) on cuda (or what prepare returned)
        # batches: generator of exactly 384 (x, y) pairs, (32, 256) each,
        #          on device — ~3.1M tokens. One pass; this IS the budget.
        # bf16 autocast, fused/foreach optimizers, Muon, compiled steps —
        # anything that keeps final val loss within 0.05 nats of baseline.

Checks: >= 1.5x wall-clock speedup over the eager-fp32 baseline AND final
val loss within 0.05 of the baseline's.
"""

import time

import torch

from .common import check, load_solution, require_cuda
from . import traindata


SPEEDUP_TARGET = 1.5
LOSS_GAP_TOL = 0.05
CFG = traindata.SPEED_CONFIG
STEPS = traindata.SPEED_STEPS


def _fresh_model(device):
    return traindata.TrainGPT(CFG).to(device)


def _batches(device):
    return traindata.train_batches(
        device=device, steps=STEPS, seq=CFG["block_size"]
    )


def _eval(model, device):
    return traindata.val_loss(
        model, device=device, seq=CFG["block_size"], after_steps=STEPS
    )


def grade():
    checks, metrics = [], {}
    require_cuda()
    device = "cuda"
    fn, found = load_solution("train_speedup", "train")
    checks.append(found)
    if fn is None:
        return checks, metrics
    import solutions.train_speedup as user_mod
    prepare = getattr(user_mod, "prepare", None)

    # Warm the device/allocator so neither timed run pays first-touch costs.
    warm = _fresh_model(device)
    traindata.reference_train(
        warm, traindata.train_batches(device=device, steps=4, seq=CFG["block_size"]), total=4
    )
    del warm
    torch.cuda.empty_cache()

    base_model = _fresh_model(device)
    torch.cuda.synchronize()
    t0 = time.perf_counter()
    traindata.reference_train(base_model, _batches(device), total=STEPS)
    torch.cuda.synchronize()
    base_s = time.perf_counter() - t0
    base_loss = _eval(base_model, device)
    del base_model
    torch.cuda.empty_cache()

    try:
        user_model = _fresh_model(device)
        if prepare is not None:
            user_model = prepare(user_model) or user_model  # untimed setup
        torch.cuda.synchronize()
        t0 = time.perf_counter()
        fn(user_model, _batches(device))
        torch.cuda.synchronize()
        user_s = time.perf_counter() - t0
    except Exception as e:
        checks.append(check("train", False, f"raised {type(e).__name__}: {e}"))
        return checks, metrics
    user_loss = _eval(user_model, device)

    speedup = base_s / max(user_s, 1e-9)
    loss_gap = max(0.0, user_loss - base_loss)
    metrics["speedup"] = round(speedup, 3)
    metrics["loss_gap"] = round(loss_gap, 4)
    metrics["base_s"] = round(base_s, 2)
    metrics["user_s"] = round(user_s, 2)
    metrics["base_val_loss"] = round(base_loss, 4)
    metrics["user_val_loss"] = round(user_loss, 4)

    checks.append(check(
        "speedup", speedup >= SPEEDUP_TARGET,
        f"your loop: {user_s:.2f}s vs baseline {base_s:.2f}s = {speedup:.2f}x "
        f"(need >= {SPEEDUP_TARGET}x, same device, same token budget; prepare() is untimed)",
    ))
    checks.append(check(
        "loss-matched", loss_gap <= LOSS_GAP_TOL,
        f"final val loss {user_loss:.4f} vs baseline {base_loss:.4f} "
        f"(gap {loss_gap:.4f}, tolerance {LOSS_GAP_TOL}) — speed doesn't count if the model got worse",
    ))
    return checks, metrics
