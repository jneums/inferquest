# InferQuest grading harness

Automated graders for the hands-on GPU tasks. You write solutions on your own
machine (this is where your GPU is — the site can't run your kernels for you),
the harness checks them for **correctness against references** and **measured
performance**, and prints a JSON report you paste into the task's verifier on
the site.

```bash
pip install torch triton            # triton only needed for the Triton tasks
python harness/run.py --list        # see the graders
python harness/run.py softmax-triton
```

Each grader's docstring (open `harness/graders/<name>.py`) is the task
contract: the exact file to create under `harness/solutions/` and the
function/class signature to implement. The website task says the same thing.

Reports include your GPU model, per-check results, and measured metrics
(errors, TFLOPS, speedups) — they're stored with your completion as receipts.

## Honesty

The measurements run on your hardware, so this is honest-by-construction, not
tamper-proof — like a typing test or a fitness app. The reports exist to make
your progress *legible* (real numbers, real GPU names), and the thresholds are
relative (fraction of cuBLAS, speedup vs naive) so any CUDA GPU can pass.
Faking a report would only be cheating yourself out of the one thing the
curriculum produces: the ability to do this work in an interview.
