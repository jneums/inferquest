import type { LibraryEntry, LibraryKind, Quest } from "@/lib/types";

/**
 * The library: sources the curriculum recommends without assigning.
 * Books that span phases, canon that serves the whole map, references you
 * consult rather than finish. No XP, no checkboxes — the editorial "why"
 * is the point. Order within a kind is editorial, not alphabetical.
 *
 * Spec: docs/specs/library.md. Validated by scripts/audit-curriculum.ts.
 */
export const LIBRARY: LibraryEntry[] = [
  // ── Books ──
  {
    id: "llms-from-scratch",
    title: "Build a Large Language Model (From Scratch)",
    author: "Sebastian Raschka",
    kind: "book",
    url: "https://www.manning.com/books/build-a-large-language-model-from-scratch",
    year: 2024,
    access: "paid",
    phaseIds: ["p0", "p1"],
    questIds: ["mental-models", "architecture-zoo"],
    guidance:
      "Chapters 2–4 are review if you did Zero to Hero; the payload is 5–7.",
    why: [
      "The hands-on companion to the Transformer Internals phase. What it adds over Karpathy's videos: BPE tokenization done properly, loading real GPT-2 checkpoints into your own code and matching their outputs — the milestone where “my code” and “a real model” become the same thing — and fine-tuning for classification and instruction following.",
      "The repo (github.com/rasbt/LLMs-from-scratch) is fully open; the book buys you the prose and the ordering, which matter most from chapter 5 on.",
    ],
  },
  {
    id: "inference-engineering",
    title: "Inference Engineering",
    author: "Philip Kiely",
    kind: "book",
    url: "https://www.baseten.co/inference-engineering/",
    year: 2026,
    access: "free",
    phaseIds: ["p2", "p5", "p6", "p7", "p8"],
    guidance:
      "Chapters stand alone: read it once end to end early in the inference path, then return to ch. 5 (Techniques) before spec decoding and ch. 7 (Production) alongside Production Serving. Skip ch. 1 if you've finished Bedrock.",
    why: [
      "The one book that covers the inference path's whole map — models, hardware, software, techniques, production — written by someone who spent four years at an inference shop explaining these tradeoffs to customers. It's a survey, not a deep dive: FlashAttention and FLOPs accounting get a paragraph where the quests here make you build them.",
      "Use it as the connective tissue between quests: the chapter that tells you why a technique exists before the paper that tells you how, and the vocabulary reference for the interview gauntlet. Its Techniques chapter has the clearest short account of EAGLE-style speculative decoding in print. The PDF, EPUB, and audiobook are free from Baseten; only print costs money. Appendix B's reading list overlaps this library heavily — treat disagreements between the two as things to reconcile, not ignore.",
    ],
  },

  // ── Courses ──
  {
    id: "zero-to-hero",
    title: "Neural Networks: Zero to Hero",
    author: "Andrej Karpathy",
    kind: "course",
    url: "https://karpathy.ai/zero-to-hero.html",
    access: "free",
    phaseIds: ["p0", "p1"],
    guidance:
      "Videos 1–3 and 7 are the spine; 4 (activations/batchnorm) pays off once you've met LayerNorm and init scales in the wild; 5 (backprop ninja) is optional if you hand-built micrograd.",
    why: [
      "Karpathy building neural nets from scratch on camera, from a scalar autograd engine to a small GPT. It's the on-ramp task in Go Brrrr for anyone who hasn't trained a model before, and it earns a library entry because you come back: The Forward Pass rebuilds the same GPT with real weights, and the training path re-derives the backward pass you first met here.",
    ],
  },

  // ── Posts ──
  {
    id: "ezyang-pytorch-internals",
    title: "PyTorch internals",
    author: "Edward Z. Yang",
    kind: "post",
    url: "https://blog.ezyang.com/2019/05/pytorch-internals/",
    year: 2019,
    access: "free",
    phaseIds: ["p0"],
    guidance:
      "Still ~80% current. Skip the TH/THC legacy sections; read the 2020 dispatcher post as the patch.",
    why: [
      "The canonical tour of strides, views, autograd, and the operator registry — the parts of PyTorch that haven't changed in seven years. What it can't cover is the compiler stack (torch.compile: Dynamo, AOTAutograd, Inductor), which is now the other half of “internals”; the author's podcast below picks that up.",
    ],
  },
  {
    id: "ezyang-dispatcher",
    title: "Let's talk about the PyTorch dispatcher",
    author: "Edward Z. Yang",
    kind: "post",
    url: "https://blog.ezyang.com/2020/09/lets-talk-about-the-pytorch-dispatcher/",
    year: 2020,
    access: "free",
    phaseIds: ["p0"],
    why: [
      "The successor to the 2019 post's dispatch chapter: DispatchKeys as a stack of functionality (autograd, autocast, tracing) that intercepts an op before its kernel runs. Read it immediately after the internals post; together they explain why a one-line PyTorch call does so much more than launch a kernel.",
    ],
  },
  {
    id: "brrr",
    title: "Making Deep Learning Go Brrrr From First Principles",
    author: "Horace He",
    kind: "post",
    url: "https://horace.io/brrr_intro.html",
    year: 2022,
    access: "free",
    phaseIds: ["p0"],
    why: [
      "The compute/memory/overhead taxonomy the whole map leans on — it's the first assigned reading in Go Brrrr, and it sits in the library because you'll reread it: before profiling in the GPU phase, and again when decode bandwidth math shows up in the inference engine. Every perf conversation in this field silently assumes this post.",
    ],
  },

  // ── Podcasts ──
  {
    id: "pytorch-dev-podcast",
    title: "PyTorch Developer Podcast",
    author: "Edward Z. Yang",
    kind: "podcast",
    url: "https://pytorch-dev-podcast.simplecast.com/",
    access: "free",
    phaseIds: ["p0", "p3", "p4"],
    guidance:
      "10–20 min episodes, one internals topic each. Start with strides, the dispatcher, and the Inductor IR episodes.",
    why: [
      "The living edition of the internals post, by the same author, covering the compile stack the 2019 post predates. Commute-sized: each episode is one mechanism explained by someone who built it.",
    ],
  },

  // ── Reference ──
  {
    id: "llm-architecture-gallery",
    title: "LLM Architecture Gallery",
    author: "Sebastian Raschka",
    kind: "reference",
    url: "https://sebastianraschka.com/llm-architecture-gallery/",
    access: "free",
    phaseIds: ["p1", "p7"],
    questIds: ["architecture-zoo"],
    why: [
      "100+ models with layer mix, attention flavor (GQA/MLA/sliding window), KV-cache footprint, and links to each config.json and tech report. Read it as diffs from a model you've built: nearly every dense entry is the GPT skeleton plus the Llama recipe (RMSNorm, RoPE, SwiGLU, GQA); MoE, MLA, and the recurrent hybrids are the genuine departures.",
    ],
  },
  {
    id: "modal-gpu-glossary",
    title: "Modal GPU Glossary",
    author: "Modal",
    kind: "reference",
    url: "https://modal.com/gpu-glossary",
    access: "free",
    phaseIds: ["p0", "p3"],
    why: [
      "SMs, warps, occupancy, HBM, TMA, NVLink — the device vocabulary, written by people who run GPUs for a living and kept current. Skim it once early so the words are loaded, then keep it open through the CUDA and kernel phases; it answers “wait, what's a TMA” faster than the whitepapers do.",
    ],
  },
];

export const LIBRARY_BY_ID = new Map(LIBRARY.map((e) => [e.id, e]));

/** Display order and group headings on /library. */
export const KIND_ORDER: LibraryKind[] = [
  "book",
  "course",
  "post",
  "paper",
  "podcast",
  "reference",
];

export const KIND_LABEL: Record<LibraryKind, string> = {
  book: "Books",
  course: "Courses",
  post: "Posts",
  paper: "Papers",
  podcast: "Podcasts",
  reference: "Reference",
};

/** Entries that should appear on a quest's page: quest-targeted when the
 *  entry names quests, otherwise every quest in its phases. */
export function libraryForQuest(quest: Quest): LibraryEntry[] {
  return LIBRARY.filter((e) =>
    e.questIds ? e.questIds.includes(quest.id) : e.phaseIds.includes(quest.phaseId),
  );
}
