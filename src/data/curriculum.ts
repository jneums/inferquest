import type { Phase, Quest } from "@/lib/types";

/**
 * The complete path: senior SWE → employable inference engineer.
 *
 * Built from 2025–26 job-posting research (Together, Fireworks, Baseten,
 * NVIDIA, OpenAI, Anthropic, xAI, Red Hat/vLLM…), the open curricula the
 * field actually uses (GPU MODE, PMPP, Stanford CS336, CMU MLSys), and the
 * modern serving stack (vLLM V1, SGLang, TensorRT-LLM, Dynamo).
 *
 * Tasks with a `verifier` are completed by automated verification only:
 * server-side endpoint probes, GitHub merge checks, published-URL checks,
 * graded quizzes, or the local GPU harness (harness/README.md).
 */

export const PHASES: Phase[] = [
  {
    id: "p0",
    number: 0,
    title: "Bedrock",
    theme: "Mental Models",
    description:
      "The performance mental models and PyTorch fluency everything else builds on. Skimmable if you're strong here — but don't skip Horace He.",
  },
  {
    id: "p1",
    number: 1,
    title: "Transformer Internals",
    theme: "Foundations",
    description:
      "Build GPT from scratch, then learn the architecture zoo through the serving lens: attention variants, positional encodings, tokenizers, sampling, MoE.",
  },
  {
    id: "p2",
    number: 2,
    title: "The Inference Engine",
    theme: "Engine Core",
    description:
      "KV caching, continuous batching, paged attention, speculative decoding — then the capstone: build your own engine and pass a live OpenAI-conformance probe against it.",
  },
  {
    id: "p3",
    number: 3,
    title: "GPU Architecture & CUDA",
    theme: "The Metal",
    description:
      "PMPP, the memory hierarchy, occupancy, rooflines, and profiling with Nsight — learn why kernels are fast, and prove yours are.",
  },
  {
    id: "p4",
    number: 4,
    title: "Kernel Engineering",
    theme: "Kernelcraft",
    description:
      "Triton from puzzles to a working flash attention, the FlashAttention lineage, and the modern kernel-library landscape (FlashInfer, CUTLASS, ThunderKittens).",
  },
  {
    id: "p5",
    number: 5,
    title: "Quantization",
    theme: "Compression",
    description:
      "From GPTQ/AWQ to the FP8-default, NVFP4/MXFP4 present. Quantize real models with llm-compressor and prove quality with lm-eval.",
  },
  {
    id: "p6",
    number: 6,
    title: "Production Serving",
    theme: "Production",
    description:
      "vLLM V1 and SGLang on your own hardware: deploy, tune, benchmark with real methodology — and pass live conformance and latency probes against your endpoints.",
  },
  {
    id: "p7",
    number: 7,
    title: "Distributed Inference",
    theme: "Datacenter Scale",
    description:
      "TP/PP/EP, disaggregated prefill-decode, KV-cache tiering and transfer, MoE serving at scale, and the Kubernetes layer (llm-d, Gateway API, DRA).",
  },
  {
    id: "p8",
    number: 8,
    title: "Observability & Economics",
    theme: "SLOs & Cost",
    description:
      "Metrics, SLOs, goodput, capacity planning, and cost-per-token from first principles — the part that makes you dangerous in a business conversation.",
  },
  {
    id: "p9",
    number: 9,
    title: "The Arena",
    theme: "Proof of Work",
    description:
      "Merged PRs into the engines everyone runs, public benchmarks nobody can argue with, interview gauntlets, and the offer.",
  },
];

export const QUESTS: Quest[] = [
  // ═════════════════════════ Phase 0 — Bedrock ═════════════════════════
  {
    id: "mental-models",
    title: "Go Brrrr",
    tagline: "The three-bottleneck worldview: compute, memory, overhead.",
    phaseId: "p0",
    prereqs: [],
    tasks: [
      {
        id: "mm-brrr",
        title: "Read “Making Deep Learning Go Brrrr From First Principles”",
        kind: "read",
        xp: 40,
        link: "https://horace.io/brrr_intro.html",
        detail:
          "Horace He's compute/memory/overhead taxonomy. Every perf conversation in this field silently assumes this post.",
      },
      {
        id: "mm-glossary",
        title: "Skim the Modal GPU Glossary end to end",
        kind: "read",
        xp: 30,
        link: "https://modal.com/gpu-glossary",
        detail: "SMs, warps, occupancy, HBM, TMA, NVLink — get the vocabulary loaded before it's needed.",
      },
      {
        id: "mm-linalg",
        title: "Refresh linear algebra with 3Blue1Brown's Essence series",
        kind: "watch",
        xp: 30,
        link: "https://www.3blue1brown.com/topics/linear-algebra",
        detail: "Skip if matmul shapes and FLOP counting are second nature.",
      },
    ],
  },
  {
    id: "pytorch-internals",
    title: "Under the Tensor",
    tagline: "What a tensor actually is, and where Python time goes.",
    phaseId: "p0",
    prereqs: [],
    tasks: [
      {
        id: "pt-ezyang",
        title: "Read ezyang's “PyTorch internals”",
        kind: "read",
        xp: 40,
        link: "http://blog.ezyang.com/2019/05/pytorch-internals/",
        detail: "Tensor vs Storage, strides, dispatch, autograd — from a PyTorch core dev.",
      },
      {
        id: "pt-puzzles",
        title: "Solve Tensor Puzzles",
        kind: "build",
        xp: 80,
        link: "https://github.com/srush/Tensor-Puzzles",
        detail: "Sasha Rush's drills: broadcasting fluency without loops. Do all of them.",
      },
      {
        id: "pt-pyspy",
        title: "Profile a Python program with py-spy and the PyTorch profiler",
        kind: "bench",
        xp: 50,
        link: "https://github.com/benfred/py-spy",
        detail:
          "Engine host overhead (scheduler, API server) is Python. Find a real bottleneck in any project you own.",
      },
    ],
  },

  // ═════════════════════ Phase 1 — Transformer Internals ═════════════════════
  {
    id: "gpt-from-scratch",
    title: "The Forward Pass",
    tagline: "Build GPT-2 from nothing, load real weights, sample text.",
    phaseId: "p1",
    prereqs: ["mental-models"],
    tasks: [
      {
        id: "fp-karpathy",
        title: "Watch “Let's build GPT: from scratch, in code, spelled out”",
        kind: "watch",
        xp: 40,
        link: "https://www.youtube.com/watch?v=kCc8FmEb1nY",
      },
      {
        id: "fp-implement",
        title: "Implement the GPT-2 forward pass yourself",
        kind: "build",
        xp: 150,
        detail:
          "From scratch in PyTorch — embeddings, attention, MLP, layernorm placement. No nn.Transformer anything.",
      },
      {
        id: "fp-attn-harness",
        title: "Pass the grader: attention from scratch",
        kind: "build",
        xp: 150,
        detail:
          "Implement scaled dot-product attention (causal + non-causal, numerically stable) and pass the harness — checked against torch SDPA including a large-logit stability case.",
        verifier: {
          type: "harness",
          script: "attention-pytorch",
          metrics: { max_abs_err: { op: "<=", value: 1e-3 } },
        },
      },
      {
        id: "fp-weights",
        title: "Load real GPT-2 weights and generate coherent text",
        kind: "build",
        xp: 100,
        detail: "Pull the HF checkpoint into your implementation. If it rambles, your shapes are wrong somewhere.",
      },
      {
        id: "fp-tokenizer",
        title: "Watch the tokenizer video and build minbpe",
        kind: "build",
        xp: 100,
        link: "https://www.youtube.com/watch?v=zduSFxRajkE",
        detail: "BPE from scratch. Explains half of all 'weird LLM behavior' — and why streaming detokenization is subtle.",
      },
      {
        id: "fp-sampling",
        title: "Implement the sampling zoo: temperature, top-k, top-p, min-p",
        kind: "build",
        xp: 80,
        link: "https://huggingface.co/blog/how-to-generate",
        detail: "Min-p (ICLR 2025) ships in every engine now — read arxiv.org/abs/2407.01082 alongside.",
      },
    ],
  },
  {
    id: "architecture-zoo",
    title: "The Architecture Zoo",
    tagline: "MHA → MQA → GQA → MLA, RoPE, and MoE — through the serving lens.",
    phaseId: "p1",
    prereqs: ["gpt-from-scratch"],
    tasks: [
      {
        id: "zoo-mqa",
        title: "Read the MQA and GQA papers",
        kind: "paper",
        xp: 60,
        link: "https://arxiv.org/abs/2305.13245",
        detail:
          "Shazeer 2019 (one write-head) + GQA. Work out the KV-cache arithmetic for each — that IS the point of these designs.",
      },
      {
        id: "zoo-mla",
        title: "Understand MLA from the DeepSeek-V2 paper",
        kind: "paper",
        xp: 70,
        link: "https://arxiv.org/abs/2405.04434",
        detail: "Latent KV compression — mandatory 2026 knowledge. It changes cache math AND kernel design.",
      },
      {
        id: "zoo-rope",
        title: "Read RoFormer + EleutherAI's rotary embeddings explainer",
        kind: "paper",
        xp: 50,
        link: "https://blog.eleuther.ai/rotary-embeddings/",
        detail: "Then skim YaRN (arxiv.org/abs/2309.00071) — long-context serving depends on it.",
      },
      {
        id: "zoo-gqa-impl",
        title: "Add GQA + RoPE to your from-scratch GPT",
        kind: "build",
        xp: 120,
        detail: "Modify your implementation, verify logits against a HF reference model that uses them (e.g. a small Llama).",
      },
      {
        id: "zoo-moe",
        title: "Learn MoE: HF explainer, Switch Transformers, DeepSeekMoE",
        kind: "paper",
        xp: 80,
        link: "https://huggingface.co/blog/moe",
        detail:
          "Routing, capacity factors, fine-grained + shared experts. Then skim the DeepSeek-V3 report (arxiv.org/abs/2412.19437) — it doubles as a systems paper.",
      },
    ],
  },

  // ═════════════════════ Phase 2 — The Inference Engine ═════════════════════
  {
    id: "kv-cache",
    title: "The KV Cache",
    tagline: "The single most important idea in LLM serving.",
    phaseId: "p2",
    prereqs: ["gpt-from-scratch"],
    tasks: [
      {
        id: "kv-arithmetic",
        title: "Read kipply's “Transformer Inference Arithmetic” and do the math by hand",
        kind: "read",
        xp: 80,
        link: "https://kipp.ly/transformer-inference-arithmetic/",
        detail:
          "KV bytes/token, FLOPs, latency floors. Do it once by hand for a model you serve and you'll never be fooled by a benchmark again.",
      },
      {
        id: "kv-harness",
        title: "Pass the grader: KV-cached incremental decoding",
        kind: "build",
        xp: 250,
        detail:
          "Implement a cached decoder for the harness's reference GPT: prefill + O(1)-per-token decode. Graded on exact logit match AND ≥2× measured speedup over naive recompute.",
        verifier: {
          type: "harness",
          script: "cached-decoder",
          metrics: {
            max_abs_err: { op: "<=", value: 5e-3 },
            speedup: { op: ">=", value: 2 },
          },
        },
      },
      {
        id: "kv-quiz",
        title: "Pass the KV-cache sizing drill",
        kind: "quiz",
        xp: 80,
        detail: "The interview staple: cache-per-token math, GQA arithmetic, quantized-KV capacity. 75% to pass.",
        verifier: { type: "quiz", quizId: "kv-cache-math", passPct: 75 },
      },
    ],
  },
  {
    id: "batching-scheduling",
    title: "Batching & Scheduling",
    tagline: "Continuous batching is why serving companies exist.",
    phaseId: "p2",
    prereqs: ["kv-cache"],
    tasks: [
      {
        id: "batch-orca",
        title: "Read Orca (OSDI '22): iteration-level scheduling",
        kind: "paper",
        xp: 60,
        link: "https://www.usenix.org/conference/osdi22/presentation/yu",
        detail: "Pair with Anyscale's continuous-batching explainer (anyscale.com/blog/continuous-batching-llm-inference).",
      },
      {
        id: "batch-paged",
        title: "Read the vLLM/PagedAttention paper (SOSP '23)",
        kind: "paper",
        xp: 70,
        link: "https://arxiv.org/abs/2309.06180",
        detail: "The founding document of modern serving: KV fragmentation → paged blocks. Non-negotiable.",
      },
      {
        id: "batch-sarathi",
        title: "Read Sarathi-Serve: chunked prefill (OSDI '24)",
        kind: "paper",
        xp: 50,
        link: "https://arxiv.org/abs/2403.02310",
        detail: "Stall-free scheduling — now default in vLLM V1.",
      },
      {
        id: "batch-quiz",
        title: "Pass the batching & latency drill",
        kind: "quiz",
        xp: 80,
        detail: "TTFT vs ITL, continuous batching, chunked prefill, prefix caching. 75% to pass.",
        verifier: { type: "quiz", quizId: "batching-latency", passPct: 75 },
      },
    ],
  },
  {
    id: "spec-decoding",
    title: "Speculative Decoding",
    tagline: "Free tokens, provably distribution-preserving.",
    phaseId: "p2",
    prereqs: ["kv-cache"],
    tasks: [
      {
        id: "spec-leviathan",
        title: "Read Leviathan et al. and work through the rejection-sampling proof",
        kind: "paper",
        xp: 70,
        link: "https://arxiv.org/abs/2211.17192",
        detail: "min(1, p/q) acceptance + residual resampling. Interviews test whether you can prove exactness.",
      },
      {
        id: "spec-eagle",
        title: "Trace the lineage: Medusa → EAGLE 1/2/3",
        kind: "paper",
        xp: 70,
        link: "https://arxiv.org/abs/2503.01840",
        detail:
          "EAGLE-3 is the shipping default in vLLM/SGLang/TRT-LLM. Also note MTP in DeepSeek-V3 as built-in speculation.",
      },
      {
        id: "spec-quiz",
        title: "Pass the speculative decoding drill",
        kind: "quiz",
        xp: 80,
        detail: "Acceptance math, expected tokens/step, when speculation hurts. 75% to pass.",
        verifier: { type: "quiz", quizId: "specdec-drill", passPct: 75 },
      },
    ],
  },
  {
    id: "build-an-engine",
    title: "Build Your Own Engine",
    tagline: "The capstone: a real serving engine, probed live by InferQuest.",
    phaseId: "p2",
    prereqs: ["batching-scheduling"],
    tasks: [
      {
        id: "engine-nano",
        title: "Read nano-vllm end to end",
        kind: "read",
        xp: 80,
        link: "https://github.com/GeeeekExplorer/nano-vllm",
        detail: "~1.2k lines: prefix caching, TP, CUDA graphs. The nanoGPT of inference engines — your blueprint.",
      },
      {
        id: "engine-build",
        title: "Build a toy engine: continuous batching + paged-ish KV + streaming",
        kind: "build",
        xp: 300,
        detail:
          "Requests join/leave the batch at token boundaries; block-allocated KV; SSE streaming out. Any small model.",
      },
      {
        id: "engine-structured",
        title: "Add structured output (JSON mode) via token masking",
        kind: "build",
        xp: 120,
        link: "https://blog.vllm.ai/2025/01/14/struct-decode-intro.html",
        detail: "Outlines-style FSM masking, or integrate xgrammar. Read the vLLM structured-decoding intro first.",
      },
      {
        id: "engine-endpoint",
        title: "VERIFIED CAPSTONE: your engine passes the OpenAI conformance probe",
        kind: "build",
        xp: 400,
        detail:
          "Expose your engine as an OpenAI-compatible API and point InferQuest's prober at it: /v1/models, chat completions, usage accounting, max_tokens cutoff, SSE streaming framing with [DONE], and error shapes — all live-tested.",
        verifier: { type: "endpoint", suite: "openai-compat" },
      },
    ],
  },

  // ═════════════════════ Phase 3 — GPU Architecture & CUDA ═════════════════════
  {
    id: "cuda-foundations",
    title: "CUDA Foundations",
    tagline: "PMPP + GPU MODE: the canonical on-ramp.",
    phaseId: "p3",
    prereqs: ["kv-cache"],
    tasks: [
      {
        id: "cuda-pmpp-1",
        title: "PMPP chapters 1–6: execution model, memory hierarchy, occupancy",
        kind: "read",
        xp: 120,
        link: "https://shop.elsevier.com/books/programming-massively-parallel-processors/hwu/978-0-443-43900-1",
        detail: "5th edition (2026) if buying fresh; 4th is fine. These six chapters are the core.",
      },
      {
        id: "cuda-gpumode-early",
        title: "GPU MODE lectures 1–4: profiling, PMPP recap, compute & memory architecture",
        kind: "watch",
        xp: 80,
        link: "https://www.youtube.com/@GPUMODE",
        detail: "The de facto open curriculum for this job. Join the Discord while you're there — it posts jobs.",
      },
      {
        id: "cuda-puzzles",
        title: "Solve GPU Puzzles",
        kind: "kernel",
        xp: 100,
        link: "https://github.com/srush/GPU-Puzzles",
        detail: "Thread-indexing drills, zero setup on Colab.",
      },
      {
        id: "cuda-stephen-jones",
        title: "Watch “How GPU Computing Works” + “How CUDA Programming Works” (GTC)",
        kind: "watch",
        xp: 50,
        link: "https://www.nvidia.com/en-us/on-demand/session/gtcspring22-s41487/",
        detail: "Stephen Jones' talks — the best conceptual account of why GPUs are shaped this way.",
      },
      {
        id: "cuda-vecadd",
        title: "Write and launch your first kernels: vector add, then naive matmul",
        kind: "kernel",
        xp: 100,
        detail: "CUDA C++ via torch.utils.cpp_extension.load_inline, per GPU MODE lecture 1.",
      },
    ],
  },
  {
    id: "matmul-mastery",
    title: "Matmul Mastery",
    tagline: "The rite of passage: chase cuBLAS.",
    phaseId: "p3",
    prereqs: ["cuda-foundations"],
    tasks: [
      {
        id: "matmul-boehm",
        title: "Work through Simon Boehm's CUDA matmul worklog",
        kind: "read",
        xp: 100,
        link: "https://siboehm.com/articles/22/CUDA-MMM",
        detail:
          "Naive → coalesced → tiled → vectorized → warp-tiled, with measured speedups. The de facto kernel-interview prep (its author got hired to Anthropic's perf team).",
      },
      {
        id: "cuda-matmul-harness",
        title: "Pass the grader: tiled matmul at ≥40% of cuBLAS",
        kind: "kernel",
        xp: 250,
        detail:
          "Shared-memory tiling in CUDA C++ or Triton. Graded on correctness plus measured TFLOPS as a fraction of cuBLAS on 4096³ — GPU-agnostic by construction.",
        verifier: {
          type: "harness",
          script: "matmul-tiled",
          metrics: { frac_of_cublas: { op: ">=", value: 0.4 } },
        },
      },
      {
        id: "matmul-pmpp-2",
        title: "PMPP patterns: reduction, scan, histogram/atomics",
        kind: "read",
        xp: 80,
        detail: "Chapters 9–11 (4th ed. numbering) + GPU MODE lecture 9. Reductions underlie softmax and every norm.",
      },
    ],
  },
  {
    id: "profiling-roofline",
    title: "Profiling & the Roofline",
    tagline: "Nsight is your microscope; the roofline is your map.",
    phaseId: "p3",
    prereqs: ["cuda-foundations"],
    tasks: [
      {
        id: "prof-nsys",
        title: "Trace a full inference run with Nsight Systems",
        kind: "bench",
        xp: 100,
        link: "https://docs.nvidia.com/nsight-systems/",
        detail: "Find the gaps between kernels — idle GPU time is the silent killer. Do it on a real model on your fleet.",
      },
      {
        id: "prof-ncu",
        title: "Analyze your matmul in Nsight Compute",
        kind: "bench",
        xp: 100,
        link: "https://docs.nvidia.com/nsight-compute/ProfilingGuide/",
        detail: "SOL section, memory charts, occupancy. Learn to read what everyone screenshots.",
      },
      {
        id: "prof-checklist",
        title: "GPU MODE lecture 8: the CUDA performance checklist",
        kind: "watch",
        xp: 50,
        detail: "Coalescing, occupancy, ILP — the optimization playbook, in one lecture.",
      },
      {
        id: "prof-quiz",
        title: "Pass the roofline & bottleneck drill",
        kind: "quiz",
        xp: 80,
        detail: "Ridge points, arithmetic intensity of prefill vs decode, why batching works. 75% to pass.",
        verifier: { type: "quiz", quizId: "roofline-drill", passPct: 75 },
      },
      {
        id: "prof-graphs",
        title: "Learn CUDA graphs and why decode steps get graph-captured",
        kind: "read",
        xp: 50,
        link: "https://pytorch.org/blog/accelerating-pytorch-with-cuda-graphs/",
        detail: "Launch-overhead elimination — this is why vLLM/TRT-LLM capture the decode step.",
      },
    ],
  },

  // ═════════════════════ Phase 4 — Kernel Engineering ═════════════════════
  {
    id: "triton-track",
    title: "The Triton Track",
    tagline: "Python-first kernels are how 2026 writes them.",
    phaseId: "p4",
    prereqs: ["matmul-mastery"],
    tasks: [
      {
        id: "triton-tutorials",
        title: "Work through the official Triton tutorials, in order",
        kind: "kernel",
        xp: 150,
        link: "https://triton-lang.org/main/getting-started/tutorials/index.html",
        detail: "Vector add → fused softmax → matmul → layernorm → fused attention. This IS the curriculum.",
      },
      {
        id: "triton-puzzles",
        title: "Solve Triton Puzzles",
        kind: "kernel",
        xp: 100,
        link: "https://github.com/srush/Triton-Puzzles",
      },
      {
        id: "triton-softmax-harness",
        title: "Pass the grader: fused softmax within 1.25× of torch",
        kind: "kernel",
        xp: 200,
        detail:
          "Row-wise softmax in Triton: correct on odd shapes and large logits, and measured within 25% of torch.softmax on (4096, 4096).",
        verifier: {
          type: "harness",
          script: "softmax-triton",
          metrics: {
            max_abs_err: { op: "<=", value: 1e-5 },
            time_ratio_vs_torch: { op: "<=", value: 1.25 },
          },
        },
      },
    ],
  },
  {
    id: "flash-attention",
    title: "Flash Attention",
    tagline: "Online softmax, IO-awareness, and the kernel that defined the era.",
    phaseId: "p4",
    prereqs: ["triton-track"],
    tasks: [
      {
        id: "fa-derivation",
        title: "Read “From Online Softmax to FlashAttention” (UW note)",
        kind: "read",
        xp: 60,
        link: "https://courses.cs.washington.edu/courses/cse599m/23sp/notes/flashattn.pdf",
        detail: "The cleanest derivation of the online-softmax trick. Do the algebra yourself.",
      },
      {
        id: "fa-papers",
        title: "Read the FlashAttention lineage: FA1 → FA2 → FA3",
        kind: "paper",
        xp: 100,
        link: "https://arxiv.org/abs/2307.08691",
        detail: "FA2 most carefully (work partitioning); FA3 for Hopper warp-specialization. It's about HBM reads, not FLOPs.",
      },
      {
        id: "triton-flash-harness",
        title: "Pass the grader: flash attention forward in Triton",
        kind: "kernel",
        xp: 300,
        detail:
          "Causal, tiled, online-softmax — never materializing the score matrix. Graded on correctness (incl. a seq-8192 case that OOMs naive approaches) and ≥1.5× speedup over materialized attention.",
        verifier: {
          type: "harness",
          script: "flash-attention-triton",
          metrics: {
            max_abs_err: { op: "<=", value: 2e-2 },
            speedup_vs_naive: { op: ">=", value: 1.5 },
          },
        },
      },
      {
        id: "fa-landscape",
        title: "Survey the kernel-library landscape: FlashInfer, CUTLASS/CuTe, ThunderKittens",
        kind: "read",
        xp: 80,
        link: "https://github.com/flashinfer-ai/flashinfer",
        detail:
          "FlashInfer (MLSys '25 best paper — the attention library inside vLLM/SGLang), Colfax's CUTLASS tutorials, and the “GPUs Go Brrr” ThunderKittens post.",
      },
      {
        id: "fa-writeup",
        title: "VERIFIED: publish a kernel worklog",
        kind: "write",
        xp: 200,
        detail:
          "Boehm-style: the kernel, the profiler evidence, each optimization step with measured numbers. This genre of post is a known door-opener.",
        verifier: {
          type: "url",
          mustContainAny: ["kernel", "triton", "cuda", "flash attention", "matmul"],
          minWords: 800,
        },
      },
      {
        id: "fa-leaderboard",
        title: "Submit to a GPU MODE kernel leaderboard problem",
        kind: "kernel",
        xp: 150,
        link: "https://www.gpumode.com",
        detail: "Leaderboard placements are a real 2026 hiring signal — NVIDIA teams compete on it themselves.",
      },
    ],
  },

  // ═════════════════════ Phase 5 — Quantization ═════════════════════
  {
    id: "quant-theory",
    title: "Precision Games",
    tagline: "GPTQ → AWQ → FP8 default → NVFP4/MXFP4 frontier.",
    phaseId: "p5",
    prereqs: ["kv-cache"],
    tasks: [
      {
        id: "quant-visual",
        title: "Read “A Visual Guide to Quantization”",
        kind: "read",
        xp: 50,
        link: "https://newsletter.maartengrootendorst.com/p/a-visual-guide-to-quantization",
      },
      {
        id: "quant-papers",
        title: "Read GPTQ, AWQ, and SmoothQuant",
        kind: "paper",
        xp: 100,
        link: "https://arxiv.org/abs/2306.00978",
        detail:
          "Hessian-based compensation vs salient-channel scaling vs outlier migration. Interviews ask you to compare them.",
      },
      {
        id: "quant-fp8",
        title: "Learn FP8 (E4M3/E5M2) and the 4-bit block formats (NVFP4, MXFP4)",
        kind: "read",
        xp: 80,
        link: "https://developer.nvidia.com/blog/introducing-nvfp4-for-efficient-and-accurate-low-precision-inference/",
        detail:
          "FP8 W8A8 is the boring production default; block-scaled 4-bit is the Blackwell-era shift (GPT-OSS ships in MXFP4).",
      },
      {
        id: "quant-kv",
        title: "Read KIVI + the vLLM quantized-KV docs",
        kind: "paper",
        xp: 60,
        link: "https://arxiv.org/abs/2402.02750",
        detail: "Why keys quantize per-channel and values per-token. FP8 KV is a near-free 2× cache-capacity win.",
      },
      {
        id: "quant-quiz",
        title: "Pass the quantization drill",
        kind: "quiz",
        xp: 80,
        detail: "Formats, methods, quality tradeoffs, KV quantization. 75% to pass.",
        verifier: { type: "quiz", quizId: "quantization-drill", passPct: 75 },
      },
    ],
  },
  {
    id: "quant-practice",
    title: "Compress & Prove It",
    tagline: "Quantization without evals is vandalism.",
    phaseId: "p5",
    prereqs: ["quant-theory"],
    tasks: [
      {
        id: "quant-compress",
        title: "Quantize a real model with llm-compressor (FP8 + W4A16)",
        kind: "build",
        xp: 150,
        link: "https://github.com/vllm-project/llm-compressor",
        detail: "The production pipeline for vLLM. Produce both checkpoints from the same base model.",
      },
      {
        id: "quant-eval",
        title: "Run lm-eval-harness on base vs quantized, against a vLLM endpoint",
        kind: "bench",
        xp: 150,
        link: "https://github.com/EleutherAI/lm-evaluation-harness",
        detail:
          "Quality deltas on real tasks, plus throughput deltas from your benchmark harness. Red Hat's half-million-eval study is your methodology template.",
      },
      {
        id: "quant-writeup",
        title: "VERIFIED: publish your quantization study",
        kind: "write",
        xp: 150,
        detail: "Quality × speed × memory, real numbers, honest about regressions.",
        verifier: {
          type: "url",
          mustContainAny: ["quantization", "fp8", "awq", "gptq", "int4", "nvfp4"],
          minWords: 600,
        },
      },
    ],
  },

  // ═════════════════════ Phase 6 — Production Serving ═════════════════════
  {
    id: "vllm-deep",
    title: "vLLM, Deeply",
    tagline: "Not 'can use it' — 'has read it'.",
    phaseId: "p6",
    prereqs: ["build-an-engine"],
    tasks: [
      {
        id: "vllm-anatomy",
        title: "Read “Inside vLLM: Anatomy of a High-Throughput Inference System”",
        kind: "read",
        xp: 100,
        link: "https://blog.vllm.ai/2025/09/05/anatomy-of-vllm.html",
        detail: "The closest thing to a textbook chapter on engine internals. Study the V1 architecture — V0 posts describe a dead engine.",
      },
      {
        id: "vllm-trace",
        title: "Trace one request through the vLLM source",
        kind: "read",
        xp: 150,
        detail:
          "Arrival → scheduler → block manager → model runner → sampler → stream. Write down every file and class it touches.",
      },
      {
        id: "vllm-deploy",
        title: "Deploy vLLM on the fleet and tune it",
        kind: "build",
        xp: 150,
        link: "https://docs.vllm.ai",
        detail:
          "max-num-batched-tokens, prefix caching, chunked prefill, quantized weights + FP8 KV. One knob at a time, keep a results table.",
      },
      {
        id: "vllm-endpoint",
        title: "VERIFIED: your production vLLM endpoint passes the conformance probe",
        kind: "build",
        xp: 200,
        detail:
          "Expose it (with an API key) and let InferQuest probe it live — same suite your toy engine passed, now against production infrastructure.",
        verifier: { type: "endpoint", suite: "openai-compat" },
      },
    ],
  },
  {
    id: "sglang-and-bench",
    title: "SGLang & the Benchmark",
    tagline: "Two engines, one methodology, publishable numbers.",
    phaseId: "p6",
    prereqs: ["vllm-deep"],
    tasks: [
      {
        id: "sgl-paper",
        title: "Read the SGLang paper + RadixAttention blog",
        kind: "paper",
        xp: 60,
        link: "https://arxiv.org/abs/2312.07104",
        detail: "Prefix-tree KV reuse. SGLang is co-equal with vLLM in job postings — know both.",
      },
      {
        id: "bench-method",
        title: "Learn benchmark methodology: NVIDIA's series + AIPerf/GenAI-Perf",
        kind: "read",
        xp: 80,
        link: "https://developer.nvidia.com/blog/llm-inference-benchmarking-fundamental-concepts/",
        detail: "TTFT, ITL/TPOT, goodput, and the measurement pitfalls. Realistic length distributions or it doesn't count.",
      },
      {
        id: "bench-run",
        title: "Run the head-to-head: vLLM vs SGLang on identical hardware",
        kind: "bench",
        xp: 200,
        detail: "Latency-throughput Pareto curves, TTFT/ITL separated, goodput at a stated SLO, cost/M tokens.",
      },
      {
        id: "bench-latency-verified",
        title: "VERIFIED: hit the latency bar on your tuned endpoint",
        kind: "bench",
        xp: 250,
        detail:
          "InferQuest streams real completions against your endpoint and takes medians of 3 runs: TTFT ≤ 800ms and ≥ 25 tok/s single-stream. Tune until it passes.",
        verifier: {
          type: "endpoint",
          suite: "latency",
          thresholds: { ttftMsMax: 800, tokensPerSecMin: 25 },
        },
      },
      {
        id: "bench-publish",
        title: "VERIFIED: publish the benchmark post",
        kind: "write",
        xp: 200,
        detail: "The post no laptop-bound candidate can write — real hardware, real methodology, reproducible configs.",
        verifier: {
          type: "url",
          mustContainAny: ["vllm", "sglang", "ttft", "throughput", "benchmark"],
          minWords: 800,
        },
      },
      {
        id: "bench-trtllm",
        title: "Run TensorRT-LLM on one model for the NVIDIA-stack view",
        kind: "build",
        xp: 100,
        link: "https://github.com/NVIDIA/TensorRT-LLM",
      },
    ],
  },

  // ═════════════════════ Phase 7 — Distributed Inference ═════════════════════
  {
    id: "parallelism",
    title: "Parallelism",
    tagline: "TP, PP, EP — and the math of when each wins.",
    phaseId: "p7",
    prereqs: ["vllm-deep"],
    tasks: [
      {
        id: "par-scaling-book",
        title: "Read “How To Scale Your Model” — the inference chapter especially",
        kind: "read",
        xp: 120,
        link: "https://jax-ml.github.io/scaling-book/inference/",
        detail: "DeepMind's systems-math text. TPU-flavored, universally applicable. The best thing written on this.",
      },
      {
        id: "par-megatron",
        title: "Read Megatron-LM: how TP actually shards attention and MLPs",
        kind: "paper",
        xp: 60,
        link: "https://arxiv.org/abs/1909.08053",
        detail: "Column/row-parallel splits and where the all-reduces land. Pair with GPU MODE lecture 17 (NCCL).",
      },
      {
        id: "par-tp-run",
        title: "Run TP≥2 on the fleet and measure scaling efficiency",
        kind: "bench",
        xp: 150,
        detail: "It will not be 2×. Explaining exactly why (NVLink vs PCIe, all-reduce cost per layer) is the lesson.",
      },
      {
        id: "par-quiz",
        title: "Pass the parallelism drill",
        kind: "quiz",
        xp: 80,
        detail: "What gets communicated when, TP vs PP vs EP tradeoffs, interconnect math. 75% to pass.",
        verifier: { type: "quiz", quizId: "parallelism-drill", passPct: 75 },
      },
    ],
  },
  {
    id: "disagg-and-moe",
    title: "Disaggregation & MoE at Scale",
    tagline: "The 2025-26 production frontier.",
    phaseId: "p7",
    prereqs: ["parallelism"],
    tasks: [
      {
        id: "dis-distserve",
        title: "Read DistServe + the goodput blog",
        kind: "paper",
        xp: 70,
        link: "https://hao-ai-lab.github.io/blogs/distserve/",
        detail: "Prefill/decode disaggregation and per-request goodput — the framing the industry adopted.",
      },
      {
        id: "dis-mooncake",
        title: "Read Mooncake (FAST '25): KV-cache-centric serving from Kimi production",
        kind: "paper",
        xp: 70,
        link: "https://arxiv.org/abs/2407.00079",
        detail: "Cache tiering across DRAM/SSD, SLO-aware scheduling, real production numbers.",
      },
      {
        id: "dis-dynamo",
        title: "Survey the infrastructure layer: Dynamo, NIXL, LMCache, llm-d",
        kind: "read",
        xp: 80,
        link: "https://github.com/ai-dynamo/dynamo",
        detail: "KV movement is a subsystem with job reqs attached now. Know what each piece does and why it exists.",
      },
      {
        id: "dis-moe",
        title: "Read the LMSYS large-scale EP writeup (DeepSeek on 96 H100s)",
        kind: "read",
        xp: 80,
        link: "https://lmsys.org/blog/2025-05-05-large-scale-ep/",
        detail: "DeepEP, EPLB, two-batch overlap — the single best writeup of modern MoE serving.",
      },
      {
        id: "dis-k8s",
        title: "Learn the Kubernetes layer: Gateway API Inference Extension, DRA, GPU Operator",
        kind: "read",
        xp: 80,
        link: "https://gateway-api-inference-extension.sigs.k8s.io/",
        detail: "KV-aware load balancing is a K8s primitive now (GA). DRA replaced device-plugin-only thinking in 1.34.",
      },
    ],
  },

  // ═════════════════════ Phase 8 — Observability & Economics ═════════════════════
  {
    id: "observability",
    title: "Eyes on the Fleet",
    tagline: "If it isn't graphed, it isn't served.",
    phaseId: "p8",
    prereqs: ["vllm-deep"],
    tasks: [
      {
        id: "obs-metrics",
        title: "Wire vLLM /metrics into Prometheus + Grafana on the fleet",
        kind: "build",
        xp: 150,
        link: "https://docs.vllm.ai/en/latest/design/metrics.html",
        detail: "KV utilization, queue depth, TTFT histograms, per-GPU DCGM. Alert before OOM, not after.",
      },
      {
        id: "obs-otel",
        title: "Read the OpenTelemetry GenAI semantic conventions",
        kind: "read",
        xp: 40,
        link: "https://opentelemetry.io/docs/specs/semconv/gen-ai/",
        detail: "The emerging standard for LLM trace/metric naming.",
      },
      {
        id: "obs-slo",
        title: "Define SLOs for your fleet and measure goodput against them",
        kind: "bench",
        xp: 120,
        detail: "Pick TTFT/ITL targets, run load, report the % of requests meeting both. This is the Anthropic-posting skill verbatim.",
      },
    ],
  },
  {
    id: "economics",
    title: "The Cost of a Token",
    tagline: "GPU-hour → tokens → margin, from first principles.",
    phaseId: "p8",
    prereqs: ["observability"],
    tasks: [
      {
        id: "econ-first-principles",
        title: "Read “LLM Inference Economics from First Principles”",
        kind: "read",
        xp: 80,
        link: "https://www.tensoreconomics.com/p/llm-inference-economics-from-first",
        detail: "The best cost-per-token derivation published. Also skim Epoch AI's inference-economics piece.",
      },
      {
        id: "econ-inferencemax",
        title: "Study InferenceMAX's methodology",
        kind: "read",
        xp: 50,
        link: "https://inferencemax.semianalysis.com/",
        detail: "Pareto frontiers and $/M-token across hardware — the reference for how cost claims get made honestly.",
      },
      {
        id: "econ-model",
        title: "Build the cost model for YOUR fleet",
        kind: "build",
        xp: 150,
        detail:
          "Amortized hardware + power → $/M tokens at measured throughput, per model and quantization. This spreadsheet is interview gold for a founder.",
      },
      {
        id: "econ-writeup",
        title: "VERIFIED: publish “How we cut cost per token at Portal Labs”",
        kind: "write",
        xp: 250,
        detail: "The founder story with real numbers. Your single best piece of evidence.",
        verifier: {
          type: "url",
          mustContainAny: ["cost", "token", "inference", "gpu"],
          minWords: 800,
        },
      },
    ],
  },

  // ═════════════════════ Phase 9 — The Arena ═════════════════════
  {
    id: "open-source-arena",
    title: "Open Sourcerer",
    tagline: "Merged PRs into the engines everyone runs.",
    phaseId: "p9",
    prereqs: ["vllm-deep"],
    tasks: [
      {
        id: "oss-first-issue",
        title: "Claim and fix a good-first-issue",
        kind: "oss",
        xp: 100,
        link: "https://github.com/vllm-project/vllm/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22",
        detail: "vLLM is the highest-signal repo (Red Hat literally lists contribution familiarity as a hiring plus). SGLang and FlashInfer count equally here.",
      },
      {
        id: "oss-pr1",
        title: "VERIFIED: first merged PR in a major inference repo",
        kind: "oss",
        xp: 300,
        detail: "Checked live against the GitHub API: exists, merged, non-trivial.",
        verifier: {
          type: "github-pr",
          repoAllowlist: [
            "vllm-project/vllm",
            "sgl-project/sglang",
            "flashinfer-ai/flashinfer",
            "NVIDIA/TensorRT-LLM",
            "vllm-project/llm-compressor",
            "triton-lang/triton",
            "ggml-org/llama.cpp",
            "pytorch/pytorch",
          ],
        },
      },
      {
        id: "oss-pr2",
        title: "VERIFIED: merged performance or correctness PR",
        kind: "oss",
        xp: 350,
        detail: "One with benchmark numbers in the description. Same repo list, same live verification.",
        verifier: {
          type: "github-pr",
          repoAllowlist: [
            "vllm-project/vllm",
            "sgl-project/sglang",
            "flashinfer-ai/flashinfer",
            "NVIDIA/TensorRT-LLM",
            "vllm-project/llm-compressor",
            "triton-lang/triton",
            "ggml-org/llama.cpp",
            "pytorch/pytorch",
          ],
        },
      },
      {
        id: "oss-pr3",
        title: "VERIFIED: third merged PR",
        kind: "oss",
        xp: 300,
        detail: "Three merged PRs is a pattern, not a fluke — that's what a hiring manager sees.",
        verifier: {
          type: "github-pr",
          repoAllowlist: [
            "vllm-project/vllm",
            "sgl-project/sglang",
            "flashinfer-ai/flashinfer",
            "NVIDIA/TensorRT-LLM",
            "vllm-project/llm-compressor",
            "triton-lang/triton",
            "ggml-org/llama.cpp",
            "pytorch/pytorch",
          ],
        },
      },
    ],
  },
  {
    id: "interview-gauntlet",
    title: "The Gauntlet",
    tagline: "The interview, drilled until it's boring.",
    phaseId: "p9",
    prereqs: ["parallelism", "economics"],
    tasks: [
      {
        id: "gauntlet-quiz",
        title: "Pass the interview gauntlet (hard mode)",
        kind: "quiz",
        xp: 200,
        detail:
          "Mixed drill across everything: cache math, rooflines, spec-decode acceptance, parallelism, SLOs. 80% to pass — interview bar, not course bar.",
        verifier: { type: "quiz", quizId: "interview-gauntlet", passPct: 80 },
      },
      {
        id: "gauntlet-design",
        title: "Drill the system-design prompts out loud",
        kind: "build",
        xp: 100,
        detail:
          "'Design an LLM inference platform', 'serve a 70B under 200ms TTFT', 'multi-tenant GPU allocation with SLAs', 'LoRA adapter management'. Whiteboard each in 35 minutes, alone, out loud.",
      },
      {
        id: "gauntlet-resume",
        title: "Rewrite the resume around inference",
        kind: "write",
        xp: 100,
        detail:
          "Fleet ops, verified endpoints, cost-per-token wins, merged PRs, published benchmarks, harness receipts. Cut everything else.",
      },
    ],
  },
  {
    id: "the-offer",
    title: "The Offer",
    tagline: "Convert the work into the title.",
    phaseId: "p9",
    prereqs: ["open-source-arena", "interview-gauntlet"],
    tasks: [
      {
        id: "offer-targets",
        title: "Build the target list and apply to 10+",
        kind: "build",
        xp: 150,
        detail:
          "Archetype B/C/E first: engine teams (Together, Fireworks, Baseten, Red Hat/vLLM), platform teams (Anthropic, OpenAI, CoreWeave, Modal), field roles. Kernel roles (archetype A) once Phase 4 artifacts are strong.",
      },
      {
        id: "offer-interviews",
        title: "Complete 3 real interview loops",
        kind: "build",
        xp: 200,
        detail: "The first loop is a calibration exercise. Take notes on every question you couldn't nail; feed them back into the gauntlet.",
      },
      {
        id: "offer-signed",
        title: "Sign an inference engineering offer",
        kind: "build",
        xp: 1000,
        detail: "The final boss. (Comp data point from the research: senior inference roles at specialist shops clear $400k+ TC.)",
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
