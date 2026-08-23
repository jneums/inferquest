"""Shared fixtures for the training-path graders.

A deterministic synthetic corpus + a small trainable GPT. The corpus is an
order-1 Markov "language" over 512 tokens with a known entropy floor
(~1.70 nats/token), so val loss has an objective target: a correct training
loop pulls loss from ln(512) ~ 6.24 toward the floor within the token budget.
Being synthetic and platform-specific, no public checkpoint fits it — the
only way to the band is to actually train.

Grading is a FIXED workload: model dims, init seed, data seed, and token
budget are all pinned so every submission trains the same problem.
"""

import math

import torch
import torch.nn as nn
import torch.nn.functional as F

TRAIN_CONFIG = {
    "vocab_size": 512,
    "n_layer": 4,
    "n_head": 4,
    "n_embd": 128,
    "block_size": 128,
}

# Bigger workload for the speedup grader: ~25M params so an eager-fp32
# baseline takes tens of seconds even on a fast GPU — otherwise there is
# nothing measurable to speed up.
SPEED_CONFIG = {
    "vocab_size": 512,
    "n_layer": 8,
    "n_head": 8,
    "n_embd": 512,
    "block_size": 256,
}

BATCH = 32
SEQ = TRAIN_CONFIG["block_size"]
STEPS = 256                      # 32*128*256 = 1,048,576 training tokens
SPEED_STEPS = 384                # 32*256*384 = 3,145,728 training tokens
VAL_BATCHES = 16
DATA_SEED = 7
INIT_SEED = 1337

# Per-state successor distribution (same probs for every state; successors
# differ per state). Entropy floor = -sum(p ln p) ~= 1.698 nats/token.
_BRANCH_PROBS = [0.35, 0.25, 0.15, 0.10, 0.06, 0.05, 0.03, 0.01]


class _Block(nn.Module):
    def __init__(self, cfg):
        super().__init__()
        self.n_head = cfg["n_head"]
        self.ln1 = nn.LayerNorm(cfg["n_embd"])
        self.attn_qkv = nn.Linear(cfg["n_embd"], 3 * cfg["n_embd"], bias=False)
        self.attn_out = nn.Linear(cfg["n_embd"], cfg["n_embd"], bias=False)
        self.ln2 = nn.LayerNorm(cfg["n_embd"])
        self.mlp_up = nn.Linear(cfg["n_embd"], 4 * cfg["n_embd"], bias=False)
        self.mlp_down = nn.Linear(4 * cfg["n_embd"], cfg["n_embd"], bias=False)

    def forward(self, x):
        b, t, c = x.shape
        h = self.ln1(x)
        q, k, v = self.attn_qkv(h).split(c, dim=2)
        q = q.view(b, t, self.n_head, c // self.n_head).transpose(1, 2)
        k = k.view(b, t, self.n_head, c // self.n_head).transpose(1, 2)
        v = v.view(b, t, self.n_head, c // self.n_head).transpose(1, 2)
        y = F.scaled_dot_product_attention(q, k, v, is_causal=True)
        y = y.transpose(1, 2).contiguous().view(b, t, c)
        x = x + self.attn_out(y)
        x = x + self.mlp_down(F.gelu(self.mlp_up(self.ln2(x))))
        return x


class TrainGPT(nn.Module):
    """TRAIN_CONFIG: ~1.1M params (CPU-friendly); SPEED_CONFIG: ~25M."""

    def __init__(self, cfg=None):
        super().__init__()
        cfg = cfg or TRAIN_CONFIG
        self.config = cfg
        g = torch.Generator().manual_seed(INIT_SEED)  # identical init everywhere
        self.tok_emb = nn.Embedding(cfg["vocab_size"], cfg["n_embd"])
        self.pos_emb = nn.Embedding(cfg["block_size"], cfg["n_embd"])
        self.blocks = nn.ModuleList(_Block(cfg) for _ in range(cfg["n_layer"]))
        self.ln_f = nn.LayerNorm(cfg["n_embd"])
        self.head = nn.Linear(cfg["n_embd"], cfg["vocab_size"], bias=False)
        with torch.no_grad():
            for p in self.parameters():
                if p.dim() >= 2:
                    nn.init.normal_(p, mean=0.0, std=0.02, generator=g)

    def forward(self, idx):
        b, t = idx.shape
        pos = torch.arange(t, device=idx.device)
        x = self.tok_emb(idx) + self.pos_emb(pos)
        for block in self.blocks:
            x = block(x)
        return self.head(self.ln_f(x))


def entropy_floor():
    return -sum(p * math.log(p) for p in _BRANCH_PROBS)


def _successor_table(gen):
    """For each state, k pseudo-random distinct successor tokens."""
    v = TRAIN_CONFIG["vocab_size"]
    return [torch.randperm(v, generator=gen)[: len(_BRANCH_PROBS)].tolist() for _ in range(v)]


def token_stream(n_tokens, seed=DATA_SEED, offset_choices=0):
    """Deterministic Markov chain of n_tokens. offset_choices skips ahead in
    the choice stream so train/val come from disjoint sections."""
    gen = torch.Generator().manual_seed(seed)
    table = _successor_table(gen)
    cdf = torch.tensor(_BRANCH_PROBS).cumsum(0)
    total = offset_choices + n_tokens + 1
    u = torch.rand(total, generator=gen)
    choices = torch.searchsorted(cdf, u, right=True).clamp_(max=len(_BRANCH_PROBS) - 1).tolist()
    state = 0
    out = []
    for i in range(total):
        state = table[state][choices[i]]
        if i >= offset_choices:
            out.append(state)
    return torch.tensor(out, dtype=torch.long)


def _to_batches(stream, n_batches, seq):
    toks = stream[: n_batches * BATCH * seq + 1]
    x = toks[:-1].view(n_batches, BATCH, seq)
    y = toks[1:].view(n_batches, BATCH, seq)
    return [(x[i], y[i]) for i in range(n_batches)]


def train_batches(device="cpu", steps=STEPS, seed=DATA_SEED, seq=SEQ):
    """Generator yielding exactly `steps` (x, y) batches — the token budget.
    One pass; caching and re-iterating is training past the budget (i.e.
    cheating yourself — see harness/README.md)."""
    stream = token_stream(steps * BATCH * seq + 1, seed=seed)
    for x, y in _to_batches(stream, steps, seq):
        yield x.to(device), y.to(device)


def val_batches(device="cpu", seed=DATA_SEED, seq=SEQ, after_steps=STEPS):
    """Held-out shard: same process, disjoint section of the chain."""
    n = VAL_BATCHES * BATCH * seq + 1
    stream = token_stream(n, seed=seed, offset_choices=(after_steps + 4) * BATCH * seq)
    return [(x.to(device), y.to(device)) for x, y in _to_batches(stream, VAL_BATCHES, seq)]


@torch.no_grad()
def val_loss(model, device="cpu", seed=DATA_SEED, seq=SEQ, after_steps=STEPS):
    model.eval()
    losses = []
    for x, y in val_batches(device=device, seed=seed, seq=seq, after_steps=after_steps):
        logits = model(x)
        losses.append(F.cross_entropy(logits.view(-1, logits.size(-1)), y.view(-1)).item())
    model.train()
    return sum(losses) / len(losses)


def reference_train(model, batches, lr=1e-3, warmup=20, total=STEPS):
    """The plain-eager fp32 AdamW baseline used by the speedup grader and the
    calibration script. Deliberately reasonable but unoptimized."""
    opt = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=0.01)
    step = 0
    for x, y in batches:
        frac = min(1.0, (step + 1) / max(1, warmup))
        cos = 0.5 * (1 + math.cos(math.pi * step / max(1, total)))
        for pg in opt.param_groups:
            pg["lr"] = lr * frac * (0.1 + 0.9 * cos)
        logits = model(x)
        loss = F.cross_entropy(logits.view(-1, logits.size(-1)), y.view(-1))
        opt.zero_grad(set_to_none=True)
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        opt.step()
        step += 1
    return model
