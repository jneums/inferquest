import { PHASES, QUESTS, QUESTS_BY_ID, TOTAL_XP } from "@/data/curriculum";

/** Canonical origin. Override via env when a custom domain lands. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://inferquest.vercel.app";

export const SITE_NAME = "InferQuest";

export const SITE_TITLE = "InferQuest — Become an Inference Engineer";

export const TOTAL_TASKS = QUESTS.reduce((s, q) => s + q.tasks.length, 0);

export const SITE_DESCRIPTION = `A free, gamified inference engineering roadmap: ${PHASES.length} phases and ${TOTAL_TASKS} tasks of training from KV caches and CUDA kernels to production vLLM serving — with auto-verified milestones instead of a paper certificate.`;

export const VERIFIED_TASKS = QUESTS.reduce(
  (s, q) => s + q.tasks.filter((t) => t.verifier).length,
  0,
);

/** schema.org Course markup for the whole curriculum (landing page). */
export function courseJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "InferQuest: The Inference Engineering Roadmap",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    isAccessibleForFree: true,
    inLanguage: "en",
    educationalLevel: "Advanced",
    teaches: [
      "LLM inference optimization",
      "Transformer internals and KV caching",
      "Continuous batching and paged attention",
      "GPU architecture and CUDA programming",
      "Triton and flash attention kernels",
      "Quantization (INT8, FP8, GPTQ, AWQ)",
      "Production serving with vLLM and SGLang",
      "Distributed inference and tensor parallelism",
      "Inference observability and economics",
    ],
    syllabusSections: PHASES.map((p) => ({
      "@type": "Syllabus",
      name: `Phase ${p.number}: ${p.title}`,
      description: p.description,
    })),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      category: "Free",
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "Online",
      courseWorkload: "PT300H",
    },
  };
}

/** schema.org LearningResource markup for a single quest page. */
export function questJsonLd(questId: string) {
  const quest = QUESTS_BY_ID.get(questId);
  if (!quest) return null;
  const phase = PHASES.find((p) => p.id === quest.phaseId);
  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: quest.title,
    description: quest.tagline,
    url: `${SITE_URL}/quests/${quest.id}`,
    learningResourceType: "Course module",
    educationalLevel: "Advanced",
    inLanguage: "en",
    isAccessibleForFree: true,
    teaches: quest.tasks.map((t) => t.title),
    isPartOf: {
      "@type": "Course",
      name: "InferQuest: The Inference Engineering Roadmap",
      url: SITE_URL,
      ...(phase ? { hasPart: `Phase ${phase.number}: ${phase.title}` } : {}),
    },
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

/**
 * Landing-page FAQ. One source of truth: rendered as visible content AND
 * emitted as FAQPage JSON-LD — the two must match or Google flags it.
 */
export const FAQ: { q: string; a: string }[] = [
  {
    q: "What does an inference engineer do?",
    a: "Inference engineers make large language models fast and cheap to serve in production: writing and tuning GPU kernels, managing KV-cache memory, batching requests, quantizing weights, and operating engines like vLLM, SGLang, and TensorRT-LLM against latency and cost targets. It's one of the fastest-growing specialist roles in AI infrastructure.",
  },
  {
    q: "What skills do I need to become an inference engineer?",
    a: "The core inference engineering skills are transformer internals (attention, KV caching, sampling), GPU architecture and CUDA or Triton kernel writing, quantization, continuous batching and paged attention, distributed serving (tensor and pipeline parallelism), and profiling with tools like Nsight. InferQuest's roadmap covers all of these in order, with a verifier gating each major skill.",
  },
  {
    q: "Is InferQuest free? Do I get a certificate?",
    a: "InferQuest is completely free and open. There is no paper certificate — instead, milestones are auto-verified: live probes against your deployed endpoint, GPU-graded kernel submissions, and merged-PR checks against real open-source repos. The result is a portfolio of receipts, which hiring teams weigh far more than a certificate.",
  },
  {
    q: "How long does the roadmap take?",
    a: `The full path is ${TOTAL_TASKS} tasks across ${QUESTS.length} quests and ${PHASES.length} phases (${TOTAL_XP.toLocaleString()} XP). An experienced software engineer studying part-time should expect roughly six months to a year end to end — less if you already know PyTorch and CUDA, since early phases are skimmable.`,
  },
  {
    q: "Do I need my own GPU?",
    a: "For the kernel-engineering phases, yes — the grading harness runs on your own hardware, and any modern NVIDIA GPU works. Everything before that (transformer internals, the inference-engine capstone, quizzes and drills) runs on CPU or free cloud notebooks.",
  },
];

export function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}
