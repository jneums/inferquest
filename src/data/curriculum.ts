import type { Phase, Quest } from "@/lib/types";

export const PHASES: Phase[] = [
  {
    id: "p1",
    number: 1,
    title: "Transformer Internals",
    theme: "Foundations",
    description:
      "Learn the architecture through the serving lens: build inference from scratch, then make it fast step by step.",
  },
  {
    id: "p2",
    number: 2,
    title: "GPU Programming",
    theme: "The Metal",
    description:
      "CUDA, Triton, the memory hierarchy, and profiling. Learn why kernels are fast or slow — and prove it with a profiler.",
  },
  {
    id: "p3",
    number: 3,
    title: "Serving Frameworks",
    theme: "Production",
    description:
      "vLLM, SGLang, and TensorRT-LLM on real hardware. Deploy, tune, benchmark, and read the source.",
  },
  {
    id: "p4",
    number: 4,
    title: "Proof of Work",
    theme: "Going Public",
    description:
      "Merged PRs, published benchmarks, and a resume that says inference engineer. Ship the evidence.",
  },
];

export const QUESTS: Quest[] = [
  // ───────────────────────── Phase 1 ─────────────────────────
  {
    id: "forward-pass",
    title: "The Forward Pass",
    tagline: "Build GPT-2 inference from nothing.",
    phaseId: "p1",
    prereqs: [],
    tasks: [
      {
        id: "fp-karpathy",
        title: "Watch Karpathy's “Let's build GPT from scratch”",
        kind: "watch",
        xp: 30,
        link: "https://www.youtube.com/watch?v=kCc8FmEb1nY",
      },
      {
        id: "fp-nanogpt",
        title: "Read the nanoGPT source end to end",
        kind: "read",
        xp: 30,
        link: "https://github.com/karpathy/nanoGPT",
        detail: "Every line of model.py. Sketch the tensor shapes at each step.",
      },
      {
        id: "fp-implement",
        title: "Implement the GPT-2 forward pass yourself",
        kind: "build",
        xp: 120,
        detail:
          "From scratch in PyTorch (no nn.TransformerEncoder). Embeddings, attention, MLP, layernorm placement.",
      },
      {
        id: "fp-weights",
        title: "Load real GPT-2 weights and generate coherent text",
        kind: "build",
        xp: 80,
        detail: "Pull the HF checkpoint into your implementation. If it rambles, your shapes are wrong somewhere.",
      },
      {
        id: "fp-sampling",
        title: "Implement temperature, top-k, and top-p sampling",
        kind: "build",
        xp: 50,
      },
    ],
  },
  {
    id: "kv-cache",
    title: "The KV Cache",
    tagline: "The single most important idea in LLM inference.",
    phaseId: "p1",
    prereqs: ["forward-pass"],
    tasks: [
      {
        id: "kv-why",
        title: "Work out by hand what gets recomputed without a cache",
        kind: "read",
        xp: 30,
        detail: "For a 100-token prompt generating 100 tokens: count the redundant attention FLOPs.",
      },
      {
        id: "kv-implement",
        title: "Add a KV cache to your GPT-2",
        kind: "build",
        xp: 120,
      },
      {
        id: "kv-measure",
        title: "Benchmark tokens/sec before vs. after",
        kind: "bench",
        xp: 60,
        detail: "Plot tokens/sec vs. sequence length for both. The shapes of the two curves are the lesson.",
      },
      {
        id: "kv-prefill",
        title: "Explain prefill vs. decode in your own words",
        kind: "write",
        xp: 40,
        detail: "Why is prefill compute-bound and decode memory-bandwidth-bound? Include the arithmetic-intensity math.",
      },
    ],
  },
  {
    id: "batching",
    title: "Batching",
    tagline: "Serve many users without melting the GPU.",
    phaseId: "p1",
    prereqs: ["kv-cache"],
    tasks: [
      {
        id: "batch-static",
        title: "Add static batching to your toy server",
        kind: "build",
        xp: 70,
      },
      {
        id: "batch-orca",
        title: "Read the Orca paper (continuous batching)",
        kind: "paper",
        xp: 50,
        link: "https://www.usenix.org/conference/osdi22/presentation/yu",
      },
      {
        id: "batch-continuous",
        title: "Implement simple continuous batching",
        kind: "build",
        xp: 150,
        detail: "Requests join and leave the batch at token boundaries. This is the heart of every modern engine.",
      },
      {
        id: "batch-serve",
        title: "Wrap it in an HTTP server with streaming responses",
        kind: "build",
        xp: 60,
        detail: "SSE or chunked responses. Congratulations: you've written a tiny vLLM.",
      },
    ],
  },
  {
    id: "paper-trail-1",
    title: "Paper Trail I",
    tagline: "The four papers everyone will assume you've read.",
    phaseId: "p1",
    prereqs: ["forward-pass"],
    tasks: [
      {
        id: "pt1-attention",
        title: "Attention Is All You Need",
        kind: "paper",
        xp: 40,
        link: "https://arxiv.org/abs/1706.03762",
      },
      {
        id: "pt1-flash",
        title: "FlashAttention (and skim FlashAttention-2)",
        kind: "paper",
        xp: 50,
        link: "https://arxiv.org/abs/2205.14135",
        detail: "The point is IO-awareness: it's about HBM reads, not FLOPs.",
      },
      {
        id: "pt1-paged",
        title: "PagedAttention (the vLLM paper)",
        kind: "paper",
        xp: 50,
        link: "https://arxiv.org/abs/2309.06180",
      },
      {
        id: "pt1-spec",
        title: "Speculative decoding (Leviathan et al.)",
        kind: "paper",
        xp: 50,
        link: "https://arxiv.org/abs/2211.17192",
      },
      {
        id: "pt1-notes",
        title: "Publish reading notes on all four",
        kind: "write",
        xp: 80,
        detail: "One post. What each paper actually changed about serving, in your own words.",
      },
    ],
  },

  // ───────────────────────── Phase 2 ─────────────────────────
  {
    id: "cuda-basics",
    title: "CUDA Basics",
    tagline: "Your first kernels.",
    phaseId: "p2",
    prereqs: ["kv-cache"],
    tasks: [
      {
        id: "cuda-pmpp",
        title: "Read PMPP chapters 1–6",
        kind: "read",
        xp: 80,
        detail: "Programming Massively Parallel Processors — threads, blocks, memory, tiling.",
      },
      {
        id: "cuda-vecadd",
        title: "Write and run a vector-add kernel",
        kind: "kernel",
        xp: 60,
      },
      {
        id: "cuda-matmul-naive",
        title: "Write a naive matmul kernel",
        kind: "kernel",
        xp: 80,
      },
      {
        id: "cuda-matmul-tiled",
        title: "Write a tiled matmul using shared memory",
        kind: "kernel",
        xp: 120,
        detail: "Measure both against cuBLAS and report the fraction of peak you hit.",
      },
    ],
  },
  {
    id: "memory-profiling",
    title: "Memory Hierarchy & Profiling",
    tagline: "Registers → SRAM → L2 → HBM. Know it cold.",
    phaseId: "p2",
    prereqs: ["cuda-basics"],
    tasks: [
      {
        id: "prof-roofline",
        title: "Learn the roofline model; place your kernels on it",
        kind: "read",
        xp: 60,
        detail: "Compute arithmetic intensity for matmul and for decode-step attention. One is compute-bound, one is not.",
      },
      {
        id: "prof-gpumode",
        title: "Watch GPU MODE lectures 1–8",
        kind: "watch",
        xp: 80,
        link: "https://www.youtube.com/@GPUMODE",
      },
      {
        id: "prof-nsys",
        title: "Trace a full inference run with Nsight Systems",
        kind: "bench",
        xp: 70,
        detail: "Find the gaps between kernels. Idle GPU time is the silent killer.",
      },
      {
        id: "prof-ncu",
        title: "Analyze one kernel in Nsight Compute",
        kind: "bench",
        xp: 70,
        detail: "Occupancy, memory throughput, and what the profiler says limits you.",
      },
      {
        id: "prof-writeup",
        title: "Publish a kernel-profiling writeup",
        kind: "write",
        xp: 90,
        detail: "Screenshots of the profiler, the bottleneck, the fix, the speedup.",
      },
    ],
  },
  {
    id: "triton-quest",
    title: "Triton",
    tagline: "Kernels in Python that don't embarrass you.",
    phaseId: "p2",
    prereqs: ["cuda-basics"],
    tasks: [
      {
        id: "triton-tutorials",
        title: "Work through the official Triton tutorials",
        kind: "read",
        xp: 60,
        link: "https://triton-lang.org/main/getting-started/tutorials/index.html",
      },
      {
        id: "triton-softmax",
        title: "Write a fused softmax kernel in Triton",
        kind: "kernel",
        xp: 90,
      },
      {
        id: "triton-flash",
        title: "Write a simplified flash-attention kernel",
        kind: "kernel",
        xp: 150,
        detail: "Forward pass only, no masking tricks needed. Benchmark vs. PyTorch eager and SDPA.",
      },
    ],
  },

  // ───────────────────────── Phase 3 ─────────────────────────
  {
    id: "vllm-production",
    title: "vLLM in Production",
    tagline: "On your own fleet — your unfair advantage.",
    phaseId: "p3",
    prereqs: ["batching"],
    tasks: [
      {
        id: "vllm-deploy",
        title: "Deploy vLLM on the fleet with a real model",
        kind: "build",
        xp: 60,
      },
      {
        id: "vllm-bench",
        title: "Build a benchmark harness: TTFT, ITL, throughput, cost/1M tokens",
        kind: "bench",
        xp: 100,
        detail: "Realistic prompt/output length distributions, not fixed lengths.",
      },
      {
        id: "vllm-tune",
        title: "Tune it: batched tokens, prefix caching, chunked prefill",
        kind: "bench",
        xp: 90,
        detail: "Change one knob at a time; keep a table of results.",
      },
      {
        id: "vllm-quant",
        title: "Compare quantization: AWQ vs. GPTQ vs. FP8",
        kind: "bench",
        xp: 90,
        detail: "Quality (evals) and speed (your harness) on the same model.",
      },
    ],
  },
  {
    id: "sglang-showdown",
    title: "SGLang & the Showdown",
    tagline: "Head-to-head on identical hardware.",
    phaseId: "p3",
    prereqs: ["vllm-production"],
    tasks: [
      {
        id: "sgl-deploy",
        title: "Deploy SGLang on the same hardware",
        kind: "build",
        xp: 60,
      },
      {
        id: "sgl-radix",
        title: "Read the RadixAttention / SGLang paper",
        kind: "paper",
        xp: 50,
        link: "https://arxiv.org/abs/2312.07104",
      },
      {
        id: "sgl-benchmark",
        title: "Run the head-to-head benchmark",
        kind: "bench",
        xp: 100,
      },
      {
        id: "sgl-publish",
        title: "Publish the benchmark post with real fleet numbers",
        kind: "write",
        xp: 120,
        detail: "This is the post no laptop-bound candidate can write.",
      },
    ],
  },
  {
    id: "reading-source",
    title: "Reading the Source",
    tagline: "Trace one request through vLLM, end to end.",
    phaseId: "p3",
    prereqs: ["vllm-production"],
    tasks: [
      {
        id: "src-scheduler",
        title: "Read the vLLM scheduler and block manager",
        kind: "read",
        xp: 90,
      },
      {
        id: "src-trace",
        title: "Trace a request: arrival → schedule → prefill → decode → stream",
        kind: "read",
        xp: 90,
        detail: "Write down every file and class the request touches.",
      },
      {
        id: "src-notes",
        title: "Publish vLLM architecture notes",
        kind: "write",
        xp: 90,
      },
      {
        id: "src-trtllm",
        title: "Run TensorRT-LLM on one model for the NVIDIA-stack view",
        kind: "build",
        xp: 80,
      },
    ],
  },
  {
    id: "distributed",
    title: "Distributed Inference",
    tagline: "When one GPU isn't enough.",
    phaseId: "p3",
    prereqs: ["vllm-production"],
    tasks: [
      {
        id: "dist-concepts",
        title: "Learn tensor, pipeline, and expert parallelism",
        kind: "read",
        xp: 70,
        detail: "What gets communicated, when, and over what link. NVLink vs. PCIe vs. network matters.",
      },
      {
        id: "dist-tp",
        title: "Run tensor-parallel inference (TP≥2) on the fleet",
        kind: "bench",
        xp: 90,
        detail: "Measure the scaling efficiency — it will not be 2×, and knowing why is the point.",
      },
      {
        id: "dist-disagg",
        title: "Read up on disaggregated prefill/decode serving",
        kind: "paper",
        xp: 50,
        detail: "DistServe / Mooncake — why separating prefill and decode hardware wins.",
      },
    ],
  },

  // ───────────────────────── Phase 4 ─────────────────────────
  {
    id: "open-source",
    title: "Open Sourcerer",
    tagline: "Merged PRs are the credential.",
    phaseId: "p4",
    prereqs: ["reading-source"],
    tasks: [
      {
        id: "oss-issue",
        title: "Claim a good-first-issue in vLLM or SGLang",
        kind: "oss",
        xp: 60,
      },
      {
        id: "oss-pr1",
        title: "First merged PR",
        kind: "oss",
        xp: 200,
      },
      {
        id: "oss-pr2",
        title: "Merged perf or correctness PR",
        kind: "oss",
        xp: 250,
        detail: "One with benchmark numbers in the description.",
      },
      {
        id: "oss-pr3",
        title: "Third merged PR",
        kind: "oss",
        xp: 200,
      },
    ],
  },
  {
    id: "writing",
    title: "The Scribe",
    tagline: "Public writing compounds.",
    phaseId: "p4",
    prereqs: ["sglang-showdown"],
    tasks: [
      {
        id: "write-cost",
        title: "Publish: “How we cut cost/token at Portal Labs”",
        kind: "write",
        xp: 150,
        detail: "The founder story + real numbers. Your single best piece of evidence.",
      },
      {
        id: "write-deep",
        title: "Publish a technical deep-dive of your choice",
        kind: "write",
        xp: 120,
      },
      {
        id: "write-third",
        title: "Publish a third post",
        kind: "write",
        xp: 120,
      },
    ],
  },
  {
    id: "job-hunt",
    title: "The Job Hunt",
    tagline: "Convert the work into the title.",
    phaseId: "p4",
    prereqs: ["open-source"],
    tasks: [
      {
        id: "job-resume",
        title: "Rewrite the resume around inference",
        kind: "write",
        xp: 80,
        detail: "Fleet ops, cost-per-token wins, merged PRs, published benchmarks. Cut everything else.",
      },
      {
        id: "job-drills",
        title: "Drill the interview math",
        kind: "read",
        xp: 80,
        detail: "KV-cache memory math, roofline placement, batch-size vs. latency tradeoffs, design-an-inference-service.",
      },
      {
        id: "job-apply",
        title: "Apply to 10 target companies",
        kind: "build",
        xp: 100,
        detail: "Together, Fireworks, Baseten, Modal, Anyscale, the GPU clouds, and product companies serving their own models.",
      },
      {
        id: "job-offer",
        title: "Sign an inference engineering offer",
        kind: "build",
        xp: 500,
        detail: "The final boss.",
      },
    ],
  },
];

export const TASKS_BY_ID = new Map(
  QUESTS.flatMap((q) => q.tasks.map((t) => [t.id, t] as const)),
);

export const QUESTS_BY_ID = new Map(QUESTS.map((q) => [q.id, q]));

export const TOTAL_XP = QUESTS.reduce(
  (sum, q) => sum + q.tasks.reduce((s, t) => s + t.xp, 0),
  0,
);
