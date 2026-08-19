"""A small reference GPT with deterministic weights for the cached-decoder grader.

Deliberately naive: forward() always processes the full sequence. The user's
job is to reimplement this forward pass with a KV cache.
"""

import math

import torch
import torch.nn as nn
import torch.nn.functional as F

CONFIG = {
    "vocab_size": 512,
    "n_layer": 6,
    "n_head": 8,
    "n_embd": 256,
    "block_size": 512,
}


class Block(nn.Module):
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
        att = (q @ k.transpose(-2, -1)) / math.sqrt(k.size(-1))
        mask = torch.tril(torch.ones(t, t, device=x.device, dtype=torch.bool))
        att = att.masked_fill(~mask, float("-inf"))
        y = (F.softmax(att, dim=-1) @ v).transpose(1, 2).contiguous().view(b, t, c)
        x = x + self.attn_out(y)
        x = x + self.mlp_down(F.gelu(self.mlp_up(self.ln2(x))))
        return x


class MiniGPT(nn.Module):
    def __init__(self):
        super().__init__()
        self.config = CONFIG
        cfg = CONFIG
        g = torch.Generator().manual_seed(42)  # weights are deterministic everywhere
        self.tok_emb = nn.Embedding(cfg["vocab_size"], cfg["n_embd"])
        self.pos_emb = nn.Embedding(cfg["block_size"], cfg["n_embd"])
        self.blocks = nn.ModuleList(Block(cfg) for _ in range(cfg["n_layer"]))
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
