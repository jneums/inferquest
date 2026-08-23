"""Grade: first convergence — your training loop, fixed workload, fixed budget.

The harness owns the workload: a ~1.1M-param GPT (graders/traindata.py,
deterministic init) and a synthetic corpus with a known entropy floor
(~1.70 nats/token). You own the loop.

Contract — harness/solutions/first_convergence.py:

    def train(model, batches):
        # model:   TrainGPT, on device, train() mode, deterministic init
        # batches: generator of exactly 256 (x, y) LongTensor pairs on device
        #          — (32, 128) each; ~1.05M tokens total. ONE pass: this IS
        #          the token budget.
        # Train the model in place (your optimizer, your schedule) and return
        # nothing or the model. Any optimizer is fine — the from-scratch
        # AdamW you built for this quest is the point.

Checks: untrained val loss ~ ln(512) (sanity that the fixed init is intact),
final val loss within the calibrated band, and a budget of one pass.
Runs on CPU in ~10 min; any GPU in well under a minute.
"""

import math

import torch

from .common import check, load_solution
from . import traindata


# Calibrated pass band for val loss after the fixed 1M-token budget.
# From 20-seed reference runs (harness/calibrate.py) on both CPU and an
# RTX Pro 6000: mean 2.0821, sigma 0.0077, identical across devices —
# band = mean + max(5*sigma, 0.05) rounded up. The corpus entropy floor
# is ~1.698; a working AdamW-class loop lands ~2.08, a broken schedule
# or plain-SGD plateau does not get under the band.
VAL_LOSS_BAND = 2.14


def grade():
    checks, metrics = [], {}
    fn, found = load_solution("first_convergence", "train")
    checks.append(found)
    if fn is None:
        return checks, metrics

    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = traindata.TrainGPT().to(device)

    v0 = traindata.val_loss(model, device=device)
    ln_v = math.log(traindata.TRAIN_CONFIG["vocab_size"])
    checks.append(check(
        "init-sane", abs(v0 - ln_v) < 0.35,
        f"untrained val loss {v0:.3f} (expected ~ln(512) = {ln_v:.3f}) — fixed init intact",
    ))

    budget = traindata.STEPS * traindata.BATCH * traindata.SEQ
    served = {"n": 0}

    def metered():
        for x, y in traindata.train_batches(device=device):
            served["n"] += 1
            yield x, y

    model.train()
    try:
        fn(model, metered())
    except Exception as e:
        checks.append(check("train", False, f"raised {type(e).__name__}: {e}"))
        return checks, metrics

    v1 = traindata.val_loss(model, device=device)
    metrics["val_loss"] = round(v1, 4)
    metrics["val_loss_initial"] = round(v0, 4)
    metrics["batches_consumed"] = served["n"]
    metrics["token_budget"] = budget
    metrics["entropy_floor"] = round(traindata.entropy_floor(), 4)

    checks.append(check(
        "budget-consumed", served["n"] == traindata.STEPS,
        f"consumed {served['n']}/{traindata.STEPS} budget batches (must use the full budget, once)",
    ))
    checks.append(check(
        "loss-moved", v1 < v0 - 1.0,
        f"val loss {v0:.3f} -> {v1:.3f} (a working loop moves it by >1 nat on this budget)",
    ))
    if VAL_LOSS_BAND is None:
        checks.append(check(
            "val-loss-band", False,
            f"val loss {v1:.4f} — band not yet calibrated (harness/calibrate.py); "
            "update VAL_LOSS_BAND and the website task to enable passing",
        ))
    else:
        checks.append(check(
            "val-loss-band", v1 <= VAL_LOSS_BAND,
            f"val loss {v1:.4f} (band: <= {VAL_LOSS_BAND}; corpus entropy floor ~{traindata.entropy_floor():.3f})",
        ))
    return checks, metrics
