# Spec: `/library` — a curated reference shelf

**Status:** v1 shipped (2026-09-03; v1.5 companion export still open) · **Owner:** Jesse · **Scope:** ~1 day for v1

## Why

InferQuest has no home for a reference that isn't a task. Today a source can
only exist as a `read`/`watch` task inside one quest (`kind` + `link` in
`src/data/curriculum.ts`), or as a mention inside a quest's `briefing` prose.
That works for an article that *is* the task. It doesn't work for:

- books (Raschka's *Build a Large Language Model (From Scratch)*, Kiely's
  *Inference Engineering*), which span several phases and aren't "done" in
  one sitting;
- canon that serves the whole map rather than one quest (ezyang's *PyTorch
  internals* + the dispatcher follow-up, the PyTorch Developer Podcast,
  Raschka's LLM Architecture Gallery);
- anything we want to *recommend without assigning* — no XP, no checkbox.

The library is the curriculum's bibliography with a permanent address, in
the same editorial voice the `briefing` paragraphs already use: not a
summary of each source, but *why this one over the alternatives* and where
on the map it pays off.

## Goals (v1)

1. A public, static page at `/library` listing curated entries grouped by
   kind, each with a short editorial "why", the phases it serves (linked to
   `/quests`), and the outbound link.
2. A single source of truth for entries: `src/data/library.ts`, typed in
   `src/lib/types.ts`, validated by `scripts/audit-curriculum.ts`.
3. Cross-linking from quest pages: a "From the library" strip on
   `/quests/[id]` for entries that cite that quest.
4. Nav link, SEO metadata, sitemap entry — parity with existing pages.

## Non-goals (v1)

- No progress tracking, XP, or completion state for library entries. XP
  stays task-based (`ProgressState.events` keyed by `taskId`). A later v2
  may add "want to read / finished" toggles; design it then, not now.
- No user-submitted entries, comments, or ratings.
- No changes to how existing `read`/`watch` tasks work. A task that links
  to something in the library keeps its `link`; the optional `libraryId`
  below is a cross-reference, not a replacement.
- No new database tables, no auth-gated content. The page is fully static.

## Data model

Add to `src/lib/types.ts`:

```ts
export type LibraryKind =
  | "book"
  | "course"     // multi-part video/lecture series
  | "post"       // a single article or blog post
  | "paper"
  | "podcast"
  | "reference"; // glossaries, galleries, docs you consult rather than read

export interface LibraryEntry {
  id: string;                 // kebab-case, stable, used in URLs (#anchor) and cross-refs
  title: string;
  author: string;             // "Sebastian Raschka", "Edward Z. Yang", "Horace He"
  kind: LibraryKind;
  url: string;                // canonical outbound link (https)
  year?: number;              // publication year, for the "is this stale?" question
  access: "free" | "paid";    // shown as a badge; books are usually "paid"
  /** Phases this entry serves. Drives filtering and the quest-page strip. */
  phaseIds: string[];         // e.g. ["p0", "p1"]
  /** Optional finer targeting: quests that should show this entry. If
   *  omitted, the entry shows on every quest in its phaseIds. */
  questIds?: string[];
  /** Editorial, briefing voice: why this source, what to skip, where it
   *  pays off on the map. 1–3 short paragraphs. Not a summary. */
  why: string[];
  /** Optional reading guidance, e.g. "Chapters 5–7; 2–4 are review if you
   *  did Zero to Hero." Rendered as a small mono line under the title. */
  guidance?: string;
}
```

Add to `Task` (optional, non-breaking):

```ts
  /** Library entry this task is drawn from, when one exists. Lets the quest
   *  page and the companion exporter dedupe: a task with a libraryId shows
   *  the entry's "why" instead of repeating a link. */
  libraryId?: string;
```

Create `src/data/library.ts`:

```ts
import type { LibraryEntry } from "@/lib/types";
export const LIBRARY: LibraryEntry[] = [ /* seed entries below */ ];
export const LIBRARY_BY_ID = new Map(LIBRARY.map((e) => [e.id, e]));
export const KIND_LABEL: Record<LibraryKind, string> = { book: "Books", course: "Courses", ... };
```

### Validation (`scripts/audit-curriculum.ts`)

Extend the existing audit to fail on:

- duplicate `LibraryEntry.id`;
- `phaseIds` not present in `PHASES`; `questIds` not present in `QUESTS`;
- `url` not `https://`;
- any `Task.libraryId` that doesn't resolve in `LIBRARY_BY_ID`;
- an entry with empty `why`.

## Pages and components

### `/library` (`src/app/library/page.tsx`)

Static (no `"use client"` at the page level). Layout, in order:

1. **Header** — title "Library", one-sentence standfirst in the site's
   register (see Landing/Dashboard copy for tone; avoid LLM-ese — the
   repo's recent commits de-LLM'd the landing page on purpose).
2. **Phase filter** — a row of chips, one per phase (`phaseLabel` from
   `@/data/curriculum`) plus "All". Client-side only; a small
   `LibraryFilter` client component wrapping the list is fine. Filter state
   in the URL query (`?phase=p1`) so links are shareable; default All.
3. **Groups by kind**, in this order: Books, Courses, Posts, Papers,
   Podcasts, Reference. Skip empty groups. Within a group, order by the
   array order in `library.ts` (editorial, not alphabetical).
4. **Entry card** (server-rendered, `id={entry.id}` for `#anchor` links):
   - title (external link, `target="_blank" rel="noopener noreferrer"`),
     author, year, kind badge, access badge (`free`/`paid`);
   - `guidance` line in mono if present;
   - `why` paragraphs;
   - "Serves:" phase links → `/quests` (there is no per-phase route; link
     to `/quests` with the phase anchor if `QuestMap` exposes one, else
     plain `/quests`).

Style with the existing tokens (`--ink`, `--page`, `--accent`,
`--accent-strong`, `--text-primary/secondary/muted`) and the 3px-ink-border
card language used in `Dashboard.tsx` / `QuestDetail.tsx`. No new colors.

### Nav (`src/components/Nav.tsx`)

Add `{ href: "/library", label: "Library" }` to `LINKS` after Quests. The
existing `pathname.startsWith` active-state logic covers it.

### Quest page (`src/components/QuestDetail.tsx`)

Below the briefing and above the task list, render **"From the library"**
when `LIBRARY.filter(e => e.questIds?.includes(quest.id) ?? e.phaseIds.includes(quest.phaseId))`
is non-empty: a compact list of title + author + kind badge linking to
`/library#<id>` (internal), with the outbound link as a secondary icon.
Cap at 5 entries; if more match, show "and N more in the library".

Tasks that carry `libraryId` render unchanged in v1 (dedupe is a v2 nicety).

### SEO / discovery

- `generateMetadata` on the page: title `Library — InferQuest`, description
  in the style of `src/lib/seo.ts` (mention it's the curated bibliography
  for the two roadmaps; count of entries is fine to interpolate), canonical
  `/library`.
- Add `/library` to `src/app/sitemap.ts`.
- Optional: `ItemList` JSON-LD of entries, mirroring `courseJsonLd()`'s
  pattern. Low priority.

### Companion repo export (`scripts/export-companion.ts`) — v1.5

When regenerating quest READMEs, append a `## Library` section listing the
entries that match the quest (same predicate as the quest page): title,
author, url, guidance. Only for READMEs still carrying the generated-file
marker, per the script's existing contract. Do this after the page ships,
not before.

## Seed content (ship with v1)

Editorial text below is a starting point; keep the voice, tighten freely.
Entries marked *(already a task)* exist as `read`/`watch` tasks in
`curriculum.ts` — set `libraryId` on those tasks so the cross-reference
exists from day one.

1. **Build a Large Language Model (From Scratch)** — Sebastian Raschka, book,
   2024, paid (code free at github.com/rasbt/LLMs-from-scratch),
   `phaseIds: ["p0","p1"]`, `questIds: ["mental-models","architecture-zoo"]`,
   guidance: "Chapters 2–4 are review if you did Zero to Hero; the payload
   is 5–7: pretraining on real text, loading GPT-2 weights into your own
   code, and fine-tuning."
   why: The hands-on companion to the Transformer Internals phase. What it
   adds over Karpathy's videos: BPE tokenization, loading real GPT-2
   checkpoints and matching their outputs (the milestone where "my code" and
   "a real model" become the same thing), and fine-tuning for classification
   and instruction following. The repo is fully open; the book buys the
   prose and the ordering, which matter most from chapter 5 on.
   Links: https://www.manning.com/books/build-a-large-language-model-from-scratch

2. **Inference Engineering** — Philip Kiely (Baseten), book, 2026, free
   (PDF/EPUB/audiobook free from Baseten; paperback and hardcover paid),
   `phaseIds: ["p2","p5","p6","p7","p8"]`,
   guidance: "Survey-level and the chapters stand alone: read it once end to
   end early in the inference path, then return to ch. 5 Techniques before
   the spec-decoding quest and ch. 7 Production alongside Phase 6. Skip
   ch. 1 Prerequisites if you've finished Bedrock."
   why: The one book that covers the inference path's whole map — models,
   hardware, software (vLLM, TensorRT-LLM), techniques, modalities,
   production — written by someone who spent four years at an inference
   shop explaining these tradeoffs to customers. It's a survey, not a deep
   dive: FlashAttention and FLOPs accounting get a paragraph where the
   quests here make you build them. Use it as the connective tissue
   between quests — the chapter that tells you why a technique exists
   before the paper that tells you how — and as the vocabulary reference
   for the interview gauntlet. Its Techniques chapter has the clearest
   short account of EAGLE-style speculative decoding in print, and
   Appendix B's topic-organized reading list overlaps this library
   heavily; treat disagreements between the two as things to reconcile,
   not ignore.
   Links: https://www.baseten.co/inference-engineering/ (free download;
   interactive companion at https://inferenceengineering.tech/)

3. **PyTorch internals** — Edward Z. Yang, post, 2019, free, `phaseIds: ["p0"]`,
   guidance: "Still ~80% current. Skip the TH/THC legacy sections; read the
   2020 dispatcher post as the patch."
   why: The canonical tour of strides, views, autograd, and the operator
   registry — the parts that haven't changed in seven years. What it can't
   cover is the compiler stack (torch.compile: Dynamo, AOTAutograd,
   Inductor), which is now the other half of "internals."
   Link: https://blog.ezyang.com/2019/05/pytorch-internals/

4. **Let's talk about the PyTorch dispatcher** — Edward Z. Yang, post, 2020,
   free, `phaseIds: ["p0"]`. why: The successor to the 2019 post's dispatch
   chapter: DispatchKeys as a stack of functionality (autograd, autocast,
   tracing) that intercepts an op before its kernel runs. Read immediately
   after the internals post.
   Link: https://blog.ezyang.com/2020/09/lets-talk-about-the-pytorch-dispatcher/

5. **PyTorch Developer Podcast** — Edward Z. Yang, podcast, free,
   `phaseIds: ["p0","p3","p4"]`, guidance: "10–20 min episodes; one internals
   topic each. Start with strides, the dispatcher, and the Inductor IR
   episodes." why: The living edition of the internals post, by the same
   author, covering the compile stack the post predates.
   Link: https://podcasts.apple.com/us/podcast/pytorch-developer-podcast/id1566080008

6. **LLM Architecture Gallery** — Sebastian Raschka, reference, free,
   `phaseIds: ["p1","p7"]`, `questIds: ["architecture-zoo"]`. why: 100+
   models with layer mix, attention flavor (GQA/MLA/sliding window), KV-cache
   footprint, and links to each config.json and tech report. Read it as
   diffs from a model you've built: nearly every dense entry is the GPT
   skeleton plus the Llama recipe (RMSNorm, RoPE, SwiGLU, GQA); MoE, MLA,
   and the recurrent hybrids are the genuine departures.
   Link: https://sebastianraschka.com/llm-architecture-gallery/

7. **Making Deep Learning Go Brrrr From First Principles** — Horace He, post,
   2022, free, `phaseIds: ["p0"]` *(already task `mm-brrr`)*. why: reuse the
   existing task detail.

8. **Neural Networks: Zero to Hero** — Andrej Karpathy, course, free,
   `phaseIds: ["p0","p1"]` *(already task `mm-zero-to-hero`)*, guidance:
   "Videos 1–3 and 7 are the spine; 4 (activations/batchnorm) pays off once
   you've met LayerNorm and init scales in the wild; 5 (backprop ninja) is
   optional if you hand-built micrograd."

9. **Modal GPU Glossary** — Modal, reference, free, `phaseIds: ["p0","p3"]`
   *(already task `mm-glossary`)*.

## Acceptance criteria

- [ ] `npm run lint` and `npx tsc --noEmit` clean; `npm run build` succeeds.
- [ ] `scripts/audit-curriculum.ts` runs the new library checks and passes
      on the seed data; deliberately breaking a `phaseId` makes it fail.
- [ ] `/library` renders all seed entries, grouped by kind in the specified
      order; phase filter narrows the list and round-trips through the URL.
- [ ] Each card has a working outbound link (new tab) and an `id` anchor;
      `/library#llms-from-scratch` scrolls to the Raschka entry.
- [ ] Nav shows "Library" with correct active state on `/library`.
- [ ] `/quests/mental-models` shows a "From the library" strip containing
      at least the Raschka book, ezyang's post, and Zero to Hero.
- [ ] `/library` appears in the generated sitemap and has metadata + canonical.
- [ ] All nine seed entries ship with real `why` text (no placeholders).
- [ ] Copy reviewed for register: no marketing filler, no "unlock",
      no "dive deep", no "comprehensive". Match the briefing paragraphs.

## Implementation notes for whoever picks this up

- **Read `AGENTS.md` first.** The Next.js version in this repo has breaking
  changes from what most training data assumes; the guides are in
  `node_modules/next/dist/docs/`. Copy the patterns already in
  `src/app/quests/[id]/page.tsx` (`PageProps<"/quests/[id]">`, `await
  params`, `generateMetadata`) rather than reaching for memory.
- Tailwind v4 via `@tailwindcss/postcss`; tokens live in `src/app/globals.css`.
- Keep the page static. The only client component should be the filter.
- Don't touch the curriculum content beyond adding `libraryId` to the three
  tasks named above.

## Open questions

1. ~~Which inference book?~~ Resolved: *Inference Engineering* by Philip
   Kiely (entry 2). Remaining sub-question: `access` is modeled as one value,
   but this book is free digitally and paid in print. v1 shows `free` and
   says so in the `why`; if a second such case appears, widen `access` to
   `"free" | "paid" | "free-digital"`.
2. Should library entries be part of the companion export in v1, or wait
   for v1.5 as written above? (Default: wait.)
3. Do we want a per-phase route someday (`/quests?phase=p1` or
   `/phases/p1`) so "Serves:" links can be precise? Out of scope here, but
   the card design should not assume it will never exist.
