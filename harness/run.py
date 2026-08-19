#!/usr/bin/env python3
"""InferQuest local grading harness.

Runs a task's checks on your machine (correctness against references,
measured performance) and prints a JSON report to paste into the site.

Usage:
    python harness/run.py <script>          # e.g. python harness/run.py softmax-triton
    python harness/run.py --list

Your solutions live in harness/solutions/ — each script's docstring (and the
website task) tells you the exact contract to implement.
"""

import argparse
import importlib
import json
import platform
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from graders import SCRIPTS  # noqa: E402

HARNESS_VERSION = "1.0"


def collect_env():
    env = {"python": platform.python_version(), "gpu": "none"}
    try:
        import torch

        env["torch"] = torch.__version__
        if torch.cuda.is_available():
            env["gpu"] = torch.cuda.get_device_name(0)
            env["cuda"] = torch.version.cuda or "unknown"
            props = torch.cuda.get_device_properties(0)
            env["driver"] = f"{props.major}.{props.minor} (compute capability)"
    except ImportError:
        pass
    return env


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("script", nargs="?", help="grader to run")
    parser.add_argument("--list", action="store_true", help="list available graders")
    args = parser.parse_args()

    if args.list or not args.script:
        print("Available graders:")
        for name, (task_id, _) in sorted(SCRIPTS.items()):
            print(f"  {name:28s} -> task {task_id}")
        return

    if args.script not in SCRIPTS:
        print(f"Unknown grader '{args.script}'. Run with --list to see options.", file=sys.stderr)
        sys.exit(2)

    task_id, module_name = SCRIPTS[args.script]
    grader = importlib.import_module(f"graders.{module_name}")

    started = time.time()
    checks, metrics = [], {}
    try:
        checks, metrics = grader.grade()
    except Exception as e:  # a crashed grader is a failed run with a readable reason
        checks = [{"name": "grader", "passed": False, "detail": f"{type(e).__name__}: {e}"}]

    report = {
        "harness_version": HARNESS_VERSION,
        "task_id": task_id,
        "passed": all(c["passed"] for c in checks) and len(checks) > 0,
        "env": collect_env(),
        "checks": checks,
        "metrics": metrics,
        "duration_s": round(time.time() - started, 2),
    }

    for c in checks:
        print(f"  {'PASS' if c['passed'] else 'FAIL'}  {c['name']}: {c['detail']}", file=sys.stderr)
    print(f"\n{'=' * 60}", file=sys.stderr)
    print("Paste everything below into the task's verifier on the site:\n", file=sys.stderr)
    print(json.dumps(report))


if __name__ == "__main__":
    main()
