# ⚡ InferQuest

A gamified, open curriculum for becoming an **inference engineer** — freeCodeCamp-style, built as a Next.js app. Four phases take you from "what's a KV cache" to a signed offer: transformer internals → GPU programming → serving frameworks → public proof of work.

- **~60 tasks across 14 quests**, each worth XP (papers, builds, kernels, benchmarks, OSS PRs, writing)
- **10 levels**, from *Token* to *Inference Engineer*
- **Skill-tree gating** — quests unlock when prerequisites are ≥50% done
- **Streaks + activity heatmap**, GitHub-style
- **16 achievements**
- **No backend** — progress lives in your browser's localStorage, with JSON export/import (Achievements page). Cross-tab sync included.

## Run it

```bash
npm install
npm run dev   # http://localhost:3000
```

`npm run build` produces a fully static build (all routes prerendered), so it deploys anywhere — Vercel, Netlify, GitHub Pages, a $5 VPS.

## Edit the curriculum

Everything lives in data files — no UI changes needed:

- `src/data/curriculum.ts` — phases, quests, tasks, XP values, prerequisites
- `src/data/achievements.ts` — badge definitions and earn conditions
- `src/lib/levels.ts` — level titles and XP thresholds

`ROADMAP.md` is the prose version of the curriculum the app encodes.
