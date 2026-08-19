"""Grade: greedy speculative decoding (draft-k, verify, rollback, bonus token).

Contract — harness/solutions/spec_decode.py:

    def speculative_generate(target_step, draft_step, prompt_ids, n_tokens, k) -> list[int]:
        '''Greedy speculative decoding.
        target_step(ids: list[int]) -> logits for EVERY position, shape (len(ids), vocab)
        draft_step(ids: list[int])  -> logits for the LAST position only, shape (vocab,)

        Loop: draft k tokens greedily with draft_step; verify them with ONE
        target_step call over the extended sequence; accept the longest prefix
        where draft token == target argmax at that position; on first mismatch
        take the target's token instead (rollback); if all k accepted, append
        the target's bonus token. Stop at exactly n_tokens generated.
        Track your acceptance stats on the function attribute
        speculative_generate.stats = {"drafted": int, "accepted": int, "verify_calls": int}.'''

Graded on: output EXACTLY equals pure target greedy decoding (the whole point
of speculative decoding), acceptance accounting sanity, and efficiency —
tokens generated per verify call >= 1.5 with the provided ~85%-aligned draft.
"""

import torch

from .common import check, load_solution
from .minigpt import MiniGPT

N_TOKENS = 120
K = 4


def grade():
    checks, metrics = [], {}
    fn, found = load_solution("spec_decode", "speculative_generate")
    checks.append(found)
    if fn is None:
        return checks, metrics

    torch.manual_seed(7)
    model = MiniGPT().eval()
    noise_gen = torch.Generator().manual_seed(1234)

    calls = {"target": 0, "draft": 0}

    @torch.no_grad()
    def target_step(ids):
        calls["target"] += 1
        return model(torch.tensor([ids]))[0]

    @torch.no_grad()
    def draft_step(ids):
        # A deliberately imperfect draft: the target's logits plus noise,
        # tuned to agree with the target's argmax most (not all) of the time.
        calls["draft"] += 1
        logits = model(torch.tensor([ids]))[0, -1, :]
        # Noise calibrated to ~85% top-1 agreement with this model's logits.
        return logits + 0.02 * torch.randn(logits.shape, generator=noise_gen)

    prompt = torch.randint(0, model.config["vocab_size"], (24,)).tolist()

    # Reference: pure target greedy.
    ref = list(prompt)
    with torch.no_grad():
        for _ in range(N_TOKENS):
            ref.append(int(model(torch.tensor([ref]))[0, -1, :].argmax()))
    ref_new = ref[len(prompt) :]

    try:
        out = fn(target_step, draft_step, list(prompt), N_TOKENS, K)
    except Exception as e:
        checks.append(check("speculative-generate", False, f"raised {type(e).__name__}: {e}"))
        return checks, metrics

    out_new = list(out)[-N_TOKENS:] if len(out) >= N_TOKENS else list(out)
    exact = out_new == ref_new
    checks.append(check(
        "matches-target-greedy", exact,
        "output token-for-token equals pure target greedy decoding"
        if exact
        else f"output diverges from target greedy at position {next((i for i, (a, b) in enumerate(zip(out_new, ref_new)) if a != b), min(len(out_new), len(ref_new)))} — speculation must never change the output",
    ))

    stats = getattr(fn, "stats", None) or {}
    drafted = stats.get("drafted", 0)
    accepted = stats.get("accepted", 0)
    verify_calls = stats.get("verify_calls", 0) or calls["target"]
    stats_ok = drafted > 0 and 0 <= accepted <= drafted and verify_calls > 0
    checks.append(check(
        "acceptance-accounting", stats_ok,
        f"drafted={drafted}, accepted={accepted}, verify_calls={verify_calls}"
        if stats_ok
        else "set speculative_generate.stats = {'drafted', 'accepted', 'verify_calls'} with sane values",
    ))

    tokens_per_verify = N_TOKENS / max(verify_calls, 1)
    acceptance = accepted / max(drafted, 1)
    metrics["acceptance_rate"] = round(acceptance, 3)
    metrics["tokens_per_verify"] = round(tokens_per_verify, 2)
    metrics["verify_calls"] = verify_calls
    checks.append(check(
        "efficiency", tokens_per_verify >= 1.5,
        f"{tokens_per_verify:.2f} tokens per verify call (need >= 1.5; acceptance {acceptance * 100:.0f}%) — "
        + ("good" if tokens_per_verify >= 1.5 else "are you verifying one token at a time, or throwing away accepted prefixes?"),
    ))
    return checks, metrics
