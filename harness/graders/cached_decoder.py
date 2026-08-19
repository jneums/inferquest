"""Grade: KV-cached incremental decoding.

The harness defines a small reference GPT (graders/minigpt.py) with fixed
random weights. Its forward() recomputes the whole sequence every call — the
naive O(n^2)-per-sequence approach.

Contract — harness/solutions/cached_gpt.py:

    class CachedDecoder:
        def __init__(self, model):            # the harness MiniGPT (has .config, .parameters)
        def prefill(self, idx) -> Tensor:     # idx (1, prompt_len) -> logits (1, vocab) for LAST position
        def decode(self, token) -> Tensor:    # token (1, 1) -> logits (1, vocab) for the new position

    Internally you must cache K/V per layer so decode() does O(1) attention
    work per new token. You may read model.config and model weights freely —
    reimplement the forward pass with a cache; do not call model.forward in decode().

Checks: logits match the naive model exactly-ish at every step, and cached
decoding of 256 tokens is >= 2x faster than naive recompute.
"""

import time

import torch

from .common import check, load_solution
from .minigpt import MiniGPT


def grade():
    checks, metrics = [], {}
    cls, found = load_solution("cached_gpt", "CachedDecoder")
    checks.append(found)
    if cls is None:
        return checks, metrics

    device = "cuda" if torch.cuda.is_available() else "cpu"
    torch.manual_seed(1234)
    model = MiniGPT().to(device).eval()

    prompt = torch.randint(0, model.config["vocab_size"], (1, 32), device=device)
    n_new = 256

    # Naive reference: recompute the full sequence per token, greedy decode.
    with torch.no_grad():
        t0 = time.perf_counter()
        seq = prompt.clone()
        ref_logits = []
        for _ in range(n_new):
            logits = model(seq)[:, -1, :]
            ref_logits.append(logits)
            seq = torch.cat([seq, logits.argmax(-1, keepdim=True)], dim=1)
        if device == "cuda":
            torch.cuda.synchronize()
        naive_s = time.perf_counter() - t0

    # User's cached decoder, same greedy path.
    try:
        with torch.no_grad():
            t0 = time.perf_counter()
            dec = cls(model)
            logits = dec.prefill(prompt)
            max_err = 0.0
            token = logits.argmax(-1, keepdim=True).view(1, 1)
            for i in range(n_new):
                err = (logits.view(-1) - ref_logits[i].view(-1)).abs().max().item()
                max_err = max(max_err, err)
                if i + 1 < n_new:
                    logits = dec.decode(token)
                    token = logits.argmax(-1, keepdim=True).view(1, 1)
            if device == "cuda":
                torch.cuda.synchronize()
            cached_s = time.perf_counter() - t0
    except Exception as e:
        checks.append(check("cached-decode", False, f"raised {type(e).__name__}: {e}"))
        return checks, metrics

    speedup = naive_s / max(cached_s, 1e-9)
    metrics["max_abs_err"] = max_err
    metrics["speedup"] = round(speedup, 2)
    metrics["naive_s"] = round(naive_s, 3)
    metrics["cached_s"] = round(cached_s, 3)

    checks.append(check(
        "logits-match", max_err <= 5e-3,
        f"max abs logit error vs naive over {n_new} steps: {max_err:.2e} (tolerance 5e-3)",
    ))
    checks.append(check(
        "speedup", speedup >= 2.0,
        f"cached decoding {speedup:.1f}x faster than naive recompute (need >= 2x; "
        f"naive {naive_s:.2f}s vs cached {cached_s:.2f}s for {n_new} tokens)",
    ))
    return checks, metrics
