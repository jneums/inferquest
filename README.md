# ⚡ InferQuest

**Live at [inferquest.org](https://inferquest.org)** — free, no catch.

A gamified, **verified** curriculum for becoming an inference engineer — freeCodeCamp for LLM serving. Built from real 2025–26 job-market research (Together, Fireworks, Baseten, NVIDIA, OpenAI, Anthropic, Red Hat/vLLM postings), the curricula the field actually uses (GPU MODE, PMPP, Stanford CS336), and the modern stack (vLLM V1, SGLang, TensorRT-LLM, Dynamo).

**10 phases · 28 quests · 129 tasks · 15,700 XP · 26 automatically verified tasks.**

## What "verified" means

Checkboxes are cheap. These aren't checkboxes:

| Verifier | What it does |
|---|---|
| **Endpoint probe** | The server live-tests your deployed LLM endpoint for OpenAI API conformance: `/v1/models` shape, chat completions, usage accounting, `max_tokens` cutoff with `finish_reason="length"`, SSE streaming framing with `[DONE]`, error shapes. Built against the OpenAI OpenAPI spec and verified vLLM/SGLang behavior, tolerating their documented deviations. |
| **Latency probe** | Streams real completions against your endpoint, takes the median of 3 runs: TTFT and tokens/sec must clear the task's thresholds. |
| **GitHub PR check** | Verifies your PR exists, **is merged**, and is non-trivial — live against the GitHub API, restricted to major inference repos (vLLM, SGLang, FlashInfer, TensorRT-LLM, Triton, llama.cpp…). |
| **GPU harness** | `python harness/run.py <task>` grades your kernels/implementations on your own GPU — correctness vs references AND measured performance (fraction of cuBLAS, speedup vs naive) — and emits a signed-shape JSON report the server validates. See `harness/README.md`. |
| **Graded quizzes** | Interview-style drills (KV-cache math, rooflines, spec-decode acceptance, parallelism) graded server-side; answers never ship to the client. |
| **URL check** | Published writeups are fetched, must be live, substantial, and on-topic. |

Progress and verification receipts (probe results, harness metrics, merged-PR evidence) live in Postgres per account. Anonymous visitors can still browse and check off unverified tasks in localStorage; on first sign-in that progress merges into the account.

## Stack

Next.js 16 · React 19 · Tailwind v4 · Clerk (auth) · Drizzle + Postgres (works with Vercel Postgres/Neon or Render) · zod.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in Clerk keys + DATABASE_URL
npm run db:migrate           # applies drizzle/ migrations to DATABASE_URL
npm run dev
```

On Vercel: add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `DATABASE_URL` (pooled connection string) as env vars, and run `npm run db:migrate` once against the production DB. `GITHUB_TOKEN` is optional (raises PR-verifier rate limits).

## Tests

```bash
npm run test:verifiers   # mock OpenAI servers (compliant + broken), live GitHub/URL probes, harness/quiz validation
```

## Editing the curriculum

- `src/data/curriculum.ts` — phases, quests, tasks, XP, prerequisites, verifier specs
- `src/server/quizBank.ts` — quiz questions + answers (server-only)
- `harness/graders/` — GPU task graders and their contracts
- `src/data/achievements.ts`, `src/lib/levels.ts` — badges and level thresholds
