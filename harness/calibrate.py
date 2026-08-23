#!/usr/bin/env python3
"""Calibrate the first-convergence pass band with multi-seed reference runs.

Runs the harness's own reference training loop (plain AdamW — see
graders/traindata.py::reference_train) N times with different DATA seeds on
this machine, and prints the val-loss distribution plus a suggested band
(mean + max(5*sigma, 0.05), rounded up).

Run it on each distinct GPU class in the fleet; the shipped band should
cover the worst (highest) suggestion. CPU runs work too (slow).

    python harness/calibrate.py --seeds 20
"""

import argparse
import math
import statistics
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

import torch  # noqa: E402

from graders import traindata  # noqa: E402


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--seeds", type=int, default=20, help="number of reference runs")
    args = ap.parse_args()

    device = "cuda" if torch.cuda.is_available() else "cpu"
    name = torch.cuda.get_device_name(0) if device == "cuda" else "cpu"
    print(f"device: {name} | torch {torch.__version__} | {args.seeds} runs "
          f"| budget {traindata.STEPS * traindata.BATCH * traindata.SEQ:,} tokens", file=sys.stderr)

    losses = []
    for s in range(args.seeds):
        seed = traindata.DATA_SEED + s
        model = traindata.TrainGPT().to(device)
        t0 = time.perf_counter()
        traindata.reference_train(model, traindata.train_batches(device=device, seed=seed))
        vl = traindata.val_loss(model, device=device, seed=seed)
        losses.append(vl)
        print(f"  seed {seed:3d}: val_loss {vl:.4f}  ({time.perf_counter() - t0:.1f}s)", file=sys.stderr)

    mean = statistics.mean(losses)
    sigma = statistics.stdev(losses) if len(losses) > 1 else 0.0
    band = math.ceil((mean + max(5 * sigma, 0.05)) * 100) / 100
    print(f"\nval_loss: mean {mean:.4f}  sigma {sigma:.4f}  "
          f"min {min(losses):.4f}  max {max(losses):.4f}", file=sys.stderr)
    print(f"suggested VAL_LOSS_BAND (this device): {band}", file=sys.stderr)
    print(f"entropy floor of the corpus: {traindata.entropy_floor():.4f}", file=sys.stderr)
    print(band)


if __name__ == "__main__":
    main()
