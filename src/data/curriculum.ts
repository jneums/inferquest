import type { LearningPath, PathId, Phase, Quest } from "@/lib/types";

/**
 * Two paths, one trunk:
 *  - Inference Engineering: senior SWE → employable inference engineer.
 *  - Model Training: build LLMs as good as possible on cheap hardware →
 *    pretraining / post-training / RL engineering roles.
 *
 * Built from 2025–26 job-posting research (Together, Fireworks, Baseten,
 * NVIDIA, OpenAI, Anthropic, xAI, Red Hat/vLLM, Liquid, Zyphra, Prime
 * Intellect, AI2…), the open curricula the field actually uses (GPU MODE,
 * PMPP, Stanford CS336, CMU MLSys, the HF playbooks), and the modern stacks
 * (vLLM V1, SGLang, TensorRT-LLM, Dynamo; TRL v1, torchtitan, OLMo 3).
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

  // ─────────────── Model Training path — its own phases ───────────────
  {
    id: "t1",
    number: 1,
    title: "Learning to Learn",
    theme: "Optimization",
    pathId: "training",
    description:
      "The other half of the transformer: gradients, optimizers, and a loop that converges — plus data curation and the scaling-laws math that decides every training run.",
  },
  {
    id: "t2",
    number: 2,
    title: "The Speedrun",
    theme: "Efficiency",
    pathId: "training",
    description:
      "The modded-nanoGPT lineage: Muon, FP8, fused kernels, multi-GPU training — then the capstone: pretrain a real GPT-2-class model on your own hardware or fifty dollars.",
  },
  {
    id: "t3",
    number: 3,
    title: "Post-Training",
    theme: "SFT & RL",
    pathId: "training",
    description:
      "From base model to assistant to reasoner: SFT, LoRA, DPO, then GRPO/RLVR on a single consumer GPU — the skills the largest training-side hiring category wants.",
  },
  {
    id: "t4",
    number: 4,
    title: "Proof",
    theme: "Evals",
    pathId: "training",
    description:
      "Evals are the training world's observability: harnesses, contamination, small-model pitfalls, and publishing models with honest numbers.",
  },
  {
    id: "t5",
    number: 5,
    title: "The Open Ladder",
    theme: "Receipts",
    pathId: "training",
    description:
      "Merged PRs into the training stack, the training-flavored interview drilled boring, and the target list for pretraining, post-training, and RL roles.",
  },
];

/**
 * The two learning paths. Shared phases appear in both orderings; quest
 * membership is the source of truth (Quest.paths), phase order is display.
 */
export const PATHS: LearningPath[] = [
  {
    id: "inference",
    title: "Inference Engineering",
    tagline: "Serve LLMs fast and cheap — from KV caches and kernels to production fleets.",
    phaseIds: ["p0", "p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9"],
  },
  {
    id: "training",
    title: "Model Training",
    tagline: "Build LLMs and make them as good as possible on the cheapest hardware available.",
    phaseIds: ["p0", "p1", "t1", "p3", "p4", "p5", "p7", "t2", "t3", "t4", "t5"],
  },
];

export const QUESTS: Quest[] = [
  // ═════════════════════════ Phase 0 — Bedrock ═════════════════════════
  {
    id: "mental-models",
    title: "Go Brrrr",
    tagline: "The three-bottleneck worldview: compute, memory, overhead.",
    phaseId: "p0",
    paths: ["inference", "training"],
    prereqs: [],
    briefing: [
      "Everything in this curriculum reduces to one question: which of the three bottlenecks are you hitting — compute, memory bandwidth, or overhead? Horace He's post is the canonical statement of that taxonomy, and the factory-and-warehouse framing makes arithmetic intensity an intuition instead of a formula to memorize. Pay special attention to the operator-fusion section: it explains why a chain of pointwise ops can be nearly free, and why eager-mode PyTorch sometimes isn't.",
      "Keep the taxonomy loaded for the rest of the map. The punchline of this whole field is that decode is memory-bandwidth-bound — generating one token streams every weight, plus the entire KV cache, through HBM to do comparatively little math. Batching, quantization, paged KV, speculative decoding: each later quest is an attack on one of the three bottlenecks, and you should always be able to name which one.",
    ],
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
    paths: ["inference", "training"],
    prereqs: [],
    briefing: [
      "ezyang's post is years of PyTorch core knowledge in one read, but the sleeper concept is strides: a tensor is a flat buffer plus indexing math, and view/permute/slice never copy anything. That single idea returns later as paged-KV block tables, Triton pointer arithmetic, and coalesced-access analysis — which is why the strided-tensor build is here and isn't skippable, even though it feels like a detour.",
      "py-spy earns its slot because the third bottleneck — overhead — is usually Python. In a real engine, the model runs on GPU but the scheduler, API server, and detokenizer are host code, and profiling is how you find out when they're the actual ceiling. Run it against something real you own, not a toy.",
    ],
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
      {
        id: "pt-strides",
        title: "Implement a strided tensor: reshape/permute/slice as pure stride math",
        kind: "build",
        xp: 100,
        link: "https://dlsyscourse.org/assignments/",
        detail:
          "CMU 10-714 hw3-style: views share one flat buffer (zero copy), plus a compact() that materializes. This indexing math underlies paged-KV layouts, Triton pointer arithmetic, and coalescing analysis.",
      },
    ],
  },

  // ═════════════════════ Phase 1 — Transformer Internals ═════════════════════
  {
    id: "gpt-from-scratch",
    title: "The Forward Pass",
    tagline: "Build GPT-2 from nothing, load real weights, sample text.",
    phaseId: "p1",
    paths: ["inference", "training"],
    prereqs: ["mental-models"],
    briefing: [
      "Karpathy's video is the on-ramp of choice because he doesn't present a transformer — he derives one, starting from a bigram model, so every block exists to solve a problem you've already felt. When you build yours, two details sink most re-implementations: layernorm placement (GPT-2 is pre-LN, plus a final layernorm after the last block) and softmax stability (subtract the row max — the attention grader feeds you large logits on purpose). And when real weights produce rambling text, check transposes before anything else: the HF GPT-2 checkpoint stores its linear layers Conv1D-style.",
      "The tokenizer video looks optional and isn't. BPE explains half of all “weird LLM behavior,” and streaming detokenization — why an engine can't just emit one string per token — is a genuine serving problem you'll meet again in the engine-building phase. The sampling zoo, meanwhile, is verbatim interview material at multiple serving companies.",
    ],
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
        title: "Implement the sampling zoo: temperature, top-k, top-p, min-p, beam search",
        kind: "build",
        xp: 90,
        link: "https://huggingface.co/blog/how-to-generate",
        detail:
          "Min-p (ICLR 2025) ships in every engine now — read arxiv.org/abs/2407.01082 alongside. Include beam search: Perplexity hands candidates its exact signature and unit tests, and Mistral asks top-k/top-p from scratch with no libraries.",
      },
    ],
  },
  {
    id: "architecture-zoo",
    title: "The Architecture Zoo",
    tagline: "MHA → MQA → GQA → MLA, RoPE, and MoE — through the serving lens.",
    phaseId: "p1",
    paths: ["inference", "training"],
    prereqs: ["gpt-from-scratch"],
    briefing: [
      "Read every architecture in this zoo through one lens: what it does to KV bytes per token. MQA and GQA exist because the cache, not the weights, is what caps batch size — so actually do the arithmetic per variant; that arithmetic is the content, not a chore attached to it. MLA is the one to slow down on: latent compression changes both the cache math and what an attention kernel has to do, and it's table stakes now that DeepSeek-shaped models are everywhere.",
      "EleutherAI's RoPE explainer is assigned alongside RoFormer because the paper's notation is heavier than the idea deserves; YaRN matters because context extension is a serving-time concern, not a training curiosity. Read the MoE material as systems papers — routing is an all-to-all communication problem wearing an ML costume, and it returns with force in the disaggregation quest. The build task is the checkpoint: verifying logits against a real Llama-family model catches the head-interleaving and rotation details that prose lets you gloss over.",
    ],
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
    briefing: [
      "kipply's post is the highest-leverage read on the whole map: half a dozen small formulas — KV bytes per token, FLOPs per token, bandwidth-implied latency floors — that turn “inference is slow” from vibes into arithmetic. The reason the task says do the math by hand is that the derived numbers (how many concurrent sequences fit next to the weights on an 80 GB card, why decode saturates bandwidth long before compute) are exactly what the sizing drill and a remarkable share of real interviews ask.",
      "The cached-decoder build makes the core asymmetry visceral: prefill is compute-bound and parallel, decode is bandwidth-bound and one-token-at-a-time. Every scheduling paper in the next quest exists because of that asymmetry — arrive there with it in your bones.",
    ],
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
    briefing: [
      "Read these in order — they're a three-act story. Orca's act: schedule at iteration granularity instead of request granularity, so a finished sequence leaves the batch immediately instead of holding its slot (the Anyscale explainer has the diagrams the paper lacks). PagedAttention's act: apply the OS virtual-memory playbook to the KV cache — fixed-size blocks and a block table kill the fragmentation Orca-style batching creates, and the same indirection later buys prefix caching almost for free. Sarathi's act: chunk long prefills so one fat prompt can't stall everyone else's decode — now default behavior in vLLM.",
      "The thread to watch across all three is the TTFT-versus-ITL tension: every scheduling choice trades time-to-first-token for someone against inter-token latency for someone else. The drill leans on that tension hard.",
    ],
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
    briefing: [
      "Leviathan et al. is short, and the entire value is the proof: accept a draft token with probability min(1, p/q), resample from the normalized residual on rejection, and the output distribution is exactly the target model's — not approximately, exactly. Work it until you can reproduce it on a whiteboard; that precise question gets asked, and hand-waving it is the tell interviewers look for.",
      "The lineage task is there because EAGLE won — drafting from the target's own hidden features beat separate draft models, and EAGLE-3 now ships as the default speculative method in the major engines, with DeepSeek-V3's MTP showing the idea migrating into the base model itself. The judgment call to look out for: speculation spends spare bandwidth, so at high batch sizes — where decode is no longer leaving bandwidth on the table — it can make throughput worse. Knowing when not to speculate is the senior answer.",
    ],
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
        id: "spec-harness",
        title: "Pass the grader: speculative decoding from scratch",
        kind: "build",
        xp: 250,
        detail:
          "Implement the greedy draft-verify loop (draft k, verify in ONE target call, accept prefix, rollback, bonus token) against the harness's target + noisy draft. Graded on exact equality with pure target decoding and ≥1.5 tokens per verify call.",
        verifier: {
          type: "harness",
          script: "speculative-decoding",
          metrics: {
            tokens_per_verify: { op: ">=", value: 1.5 },
            acceptance_rate: { op: ">=", value: 0.5 },
          },
        },
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
    id: "long-context",
    title: "Long Context & KV Policy",
    tagline: "When the cache can't hold everything, something has to give.",
    phaseId: "p2",
    prereqs: ["kv-cache"],
    briefing: [
      "StreamingLLM and H2O are paired because they stake out the two poles of the retention question: keep positions (the start plus a sliding window) or keep what attention actually uses (the heavy hitters). The attention-sink finding is worth internalizing on its own — the model dumps attention mass on the first tokens because softmax has to put it somewhere, and evicting them collapses quality. That's the kind of empirical quirk that separates people who've read the papers from people who've read the tweets.",
      "The vLLM hybrid-KV doc is the production counterweight: sliding-window and Mamba-style layers break the uniform-block assumption from PagedAttention, and someone has to make the block tables cope. The through-line to watch in the survey: every eviction and compression scheme trades quality for capacity somewhere invisible, which is why the eval discipline from the quantization phase applies here verbatim.",
    ],
    tasks: [
      {
        id: "lc-sinks",
        title: "Read StreamingLLM (attention sinks) and H2O (heavy-hitter eviction)",
        kind: "paper",
        xp: 70,
        link: "https://arxiv.org/abs/2309.17453",
        detail:
          "The two poles of KV retention policy: keep the start + a sliding window, or keep what attention actually uses. Both ship as engine features.",
      },
      {
        id: "lc-hybrid",
        title: "Learn sliding-window and hybrid-model KV management",
        kind: "read",
        xp: 60,
        link: "https://docs.vllm.ai/en/latest/design/hybrid_kv_cache_manager/",
        detail:
          "Gemma's sliding window and Mamba/hybrid layers need different block layouts — vLLM's hybrid KV manager is the production answer.",
      },
      {
        id: "lc-family",
        title: "Survey the KV-management family: eviction, merging, budgets, compression",
        kind: "read",
        xp: 60,
        link: "https://github.com/Zefan-Cai/Awesome-LLM-KV-Cache",
        detail:
          "Map the design space beyond quantization. Also skim sparse-attention serving (MInference-class) and prompt compression.",
      },
    ],
  },
  {
    id: "build-an-engine",
    title: "Build Your Own Engine",
    tagline: "The capstone: a real serving engine, probed live by InferQuest.",
    phaseId: "p2",
    prereqs: ["batching-scheduling"],
    briefing: [
      "nano-vllm is the blueprint because it's the rare codebase small enough to read end-to-end yet honest enough to contain the real ideas — prefix caching, tensor parallelism, CUDA graphs, in about 1.2k lines. Read it before writing a line of yours, then resist copying it: the point of the build is discovering why each piece exists by needing it.",
      "The details the probe grades are chosen deliberately — SSE framing with [DONE], usage accounting, max_tokens cutoffs, error shapes — because that's where real engines leak. Give per-request cancellation particular respect: a client disconnecting mid-stream has to free its KV blocks and leave the batch cleanly, and “streaming token generator with cancellation” shows up as a literal coding exercise at serving companies. This capstone is also load-bearing later: the flash-attention quest asks you to swap your own kernel into this engine and keep the probe green.",
    ],
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
          "Requests join/leave the batch at token boundaries; block-allocated KV; SSE streaming out with per-request cancellation and timeouts (the 'streaming token generator with cancellation' is a recurring Fireworks/Together coding exercise). Any small model.",
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
    paths: ["inference", "training"],
    prereqs: ["kv-cache"],
    briefing: [
      "PMPP is the one true textbook here, and chapters 1–6 are the load-bearing ones: the execution model (grids, blocks, warps) and the memory hierarchy are the two mental models every kernel you'll ever write leans on. GPU MODE rides alongside because it's the closest thing this niche has to a guild — practitioner lectures that recap PMPP with war stories, and a Discord that posts jobs. The Stephen Jones talks are the sleeper pick: nobody explains why GPUs are shaped this way — latency hiding through massive oversubscription — better, and that “why” is what survives after API details fade.",
      "Watch for the occupancy trap early: occupancy is a means (enough warps in flight to hide latency), not a score to maximize, and chasing it produces slow kernels with beautiful occupancy numbers. And don't skip the humble vector-add task — the load_inline workflow it teaches is how you'll iterate on every kernel through Phase 4.",
    ],
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
    paths: ["inference", "training"],
    prereqs: ["cuda-foundations"],
    briefing: [
      "Boehm's worklog is the rite of passage because it teaches the method, not just the kernel: change one thing, profile, explain the delta, repeat. Each rung has a name you'll reuse forever — coalescing, shared-memory tiling, vectorized loads, warp tiling — and the biggest single jump is coalescing, which is why memory-access patterns, not FLOPs, are the first thing to check in any slow kernel. The flash-attention quest will ask you to produce a worklog of your own in exactly this genre; it's a known door-opener.",
      "The 40%-of-cuBLAS bar is set where it is on purpose: reachable with tiling done right, unreachable by accident. Don't skip the reduction/scan/histogram patterns afterward — reductions are the skeleton of softmax, layernorm, and RMSNorm, which is to say most of what an inference kernel engineer actually ships.",
    ],
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
    paths: ["inference", "training"],
    prereqs: ["cuda-foundations"],
    briefing: [
      "The two Nsight tools answer different questions, and people conflate them constantly: Systems shows the timeline — where the GPU sits idle between kernels, the silent killer in inference — while Compute shows the inside of one kernel. Learn to read the SOL section and the memory charts; that screenshot is the lingua franca of every performance discussion. The roofline drill is here because it's the most reliable interview filter in the field: given a workload's arithmetic intensity, say which side of the ridge it lands on and what that implies. Prefill and decode land on opposite sides — that's the entire field in one picture.",
      "CUDA graphs close the loop on the overhead bottleneck from the very first quest: a decode step launches hundreds of tiny kernels, launch overhead swamps them, so engines capture the step once and replay it. And do the memory-snapshot task for real — the caching allocator and fragmentation OOMs are genuine on-call work, not curriculum filler.",
    ],
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
      {
        id: "prof-memsnap",
        title: "Debug GPU memory with torch.cuda memory snapshots",
        kind: "bench",
        xp: 70,
        link: "https://pytorch.org/blog/understanding-gpu-memory-1/",
        detail:
          "Record a snapshot of a real inference run, open it in memory_viz, and explain one allocation spike. Also learn the caching allocator and expandable_segments — fragmentation OOMs are real on-call work.",
      },
    ],
  },
  {
    id: "compiler-stack",
    title: "The Compiler Stack",
    tagline: "torch.compile is load-bearing in vLLM V1 — stop treating it as magic.",
    phaseId: "p3",
    paths: ["inference", "training"],
    prereqs: ["cuda-foundations"],
    briefing: [
      "This quest exists because vLLM V1 made torch.compile part of the engine: the model graph is compiled piecewise, split at the attention ops, and the pieces get captured into CUDA graphs — so “the compiler is magic” stops being a tenable position for anyone who wants to work on the engine. Trigger a recompile on purpose and watch the logs, because unexpected recompiles from dynamic shapes are the production footgun: a latency spike with no visible cause until you know where to look.",
      "The Inductor task is the best demystification trick in the stack: TORCH_LOGS=output_code shows you the Triton the compiler writes, fusion and tiling decisions laid bare. Reading generated kernels right before Phase 4 asks you to write your own is deliberate sequencing — you arrive with a working example of what good pointer math looks like.",
    ],
    tasks: [
      {
        id: "compile-basics",
        title: "Learn torch.compile for inference: Dynamo capture, static KV cache, recompile pitfalls",
        kind: "read",
        xp: 70,
        link: "https://huggingface.co/docs/transformers/main/en/llm_optims",
        detail:
          "Compile a decode loop with a static KV cache and measure the speedup; then trigger a recompile on purpose (dynamic shape) and watch it in the logs.",
      },
      {
        id: "compile-inductor",
        title: "Read the Triton that Inductor writes for you",
        kind: "build",
        xp: 100,
        detail:
          "TORCH_LOGS=output_code on a small fused op. Find the fusion decisions, the tiling, the pointer math — compare with the kernels you'll write in Phase 4.",
      },
      {
        id: "compile-vllm",
        title: "Read vLLM's torch.compile integration + piecewise CUDA graphs design docs",
        kind: "read",
        xp: 70,
        link: "https://docs.vllm.ai/en/latest/design/torch_compile.html",
        detail:
          "Piecewise compilation split at attention ops, captured into CUDA graphs — the concrete architecture your Phase 6 deployment runs on.",
      },
    ],
  },

  // ═════════════════════ Phase 4 — Kernel Engineering ═════════════════════
  {
    id: "triton-track",
    title: "The Triton Track",
    tagline: "Python-first kernels are how 2026 writes them.",
    phaseId: "p4",
    paths: ["inference", "training"],
    prereqs: ["matmul-mastery"],
    briefing: [
      "Leaning on the official tutorials isn't laziness — they're maintained by the compiler's own authors and sequenced exactly right: vector add teaches the programming model, fused softmax teaches the fusion win, matmul teaches block-level tiling, and fused attention previews the next quest. Triton's bargain is that you think in blocks and pointer arithmetic while the compiler handles warp-level details — which is why the stride math from Under the Tensor comes back here as code you literally write.",
      "The grader's two failure modes are taken from real life: odd shapes (masking has to be right when the row doesn't divide the block) and large logits (the max-subtraction trick from your from-scratch attention — it never stops mattering). Landing within 1.25× of torch.softmax proves you actually fused the passes rather than transliterated numpy.",
    ],
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
    paths: ["inference", "training"],
    prereqs: ["triton-track"],
    briefing: [
      "The UW note beats the FlashAttention paper as the entry point because the whole kernel falls out of one algebraic trick — the online-softmax rescaling — and the note derives it in a few pages where the paper assumes it. Do the algebra by hand; the Triton kernel is that algebra transcribed, plus tiling. The CS149 CPU rung in between is the best pedagogical bridge anyone has built: watching the N×N intermediate shrink from megabytes to kilobytes turns “IO-awareness” from a slogan into something you saw happen. That is the paper's actual claim — fewer HBM reads, not fewer FLOPs.",
      "In the lineage, read FA2 the most carefully (the work-partitioning fixes are where the practical speedup lives) and FA3 for what Hopper-era hardware demands: warp specialization and TMA. The back half of the quest is deliberately portfolio-shaped — your kernel inside your engine with the probe still green, a Boehm-style worklog, a leaderboard submission — because this is the phase whose artifacts kernel-team interviews actually ask to see.",
    ],
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
        id: "fa-cpu-rung",
        title: "Build the CPU middle rung: blocked, fused row-at-a-time attention",
        kind: "build",
        xp: 100,
        link: "https://github.com/stanford-cs149/cs149gpt",
        detail:
          "Stanford CS149's ladder: naive → blocked matmul → fused rows (watch the N×N intermediate shrink from MBs to KBs) — the teaching moment between the derivation and the Triton kernel.",
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
        id: "fa-modern-metal",
        title: "Go modern: Hopper/Blackwell features, CuTe DSL, mixed-input GEMM, AMD",
        kind: "read",
        xp: 90,
        link: "https://docs.nvidia.com/cutlass/latest/media/docs/pythonDSL/cute_dsl_general/dsl_introduction.html",
        detail:
          "TMA + warp specialization (Colfax), CuTe DSL (the GPU MODE leaderboard's NVIDIA competitions are CuTeDSL-shaped now), Marlin/Machete-style W4A16 GEMM, and a taste of ROCm/HIP — three leaderboard comps run on MI300X.",
      },
      {
        id: "fa-integrate",
        title: "Back-integrate: your flash-attention kernel inside your own engine",
        kind: "build",
        xp: 150,
        detail:
          "Swap your Triton kernel into the Phase 2 engine's attention path. It isn't done until the OpenAI-conformance probe still passes with YOUR kernel serving the tokens.",
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
    paths: ["inference", "training"],
    prereqs: ["kv-cache"],
    briefing: [
      "The GPTQ/AWQ/SmoothQuant trio is assigned together because the field's real content is the comparison: three different answers to the same enemy, activation outliers. Once you see that outliers are the whole story — GPTQ repairs the damage with second-order information, AWQ protects the channels activations say are salient, SmoothQuant migrates the difficulty from activations into weights — three algorithms to memorize collapse into one argument. Interviews ask exactly this compare-and-contrast.",
      "Hold the two-tier frame from the formats task: FP8 W8A8 is the boring production default; block-scaled 4-bit (NVFP4, MXFP4) is where the frontier moved with Blackwell, and frontier models now ship natively in it. KIVI's asymmetry is the memorable detail — keys have channel-wise outlier structure and values don't, hence per-channel keys and per-token values — and FP8 KV is the nearest-to-free 2× capacity win in serving, which plugs this quest straight back into the cache arithmetic.",
    ],
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
        id: "quant-sparsity",
        title: "Survey compression beyond quantization: pruning, 2:4 sparsity, distillation",
        kind: "read",
        xp: 60,
        link: "https://arxiv.org/abs/2306.11695",
        detail:
          "Wanda-style pruning, 2:4 semi-structured sparsity on sparse tensor cores (TRT-LLM ships it), and Minitron-style distillation — which also trains spec-decode drafts.",
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
    briefing: [
      "The from-scratch quantizer comes first because scale-and-zero-point per group is trivial to describe and instructive to get exactly right — the grader's outlier-heavy weights show you precisely why per-tensor fails, which is the entire motivation of the theory quest made concrete. The sensitivity scan is the professional habit hiding in the middle: measure where the model is fragile and spend precision there, before reaching for anyone's uniform recipe.",
      "llm-compressor and lm-eval-harness are the production pairing — one produces the checkpoint vLLM actually loads, the other tells you what it cost you. The discipline this quest teaches is the tagline: a speedup number without a quality delta next to it is not a result. Publish the regressions too — honest numbers are rarer than good ones, and hiring managers can tell the difference.",
    ],
    tasks: [
      {
        id: "quant-scratch-harness",
        title: "Pass the grader: build a group-wise W4 quantizer from scratch",
        kind: "build",
        xp: 200,
        detail:
          "Scale/zero-point derivation, per-group granularity, dequantize — no quantization libraries. Graded on 4-bit validity, beating the per-tensor baseline ≥3× on outlier-heavy weights, and keeping the reference GPT's predictions intact end-to-end.",
        verifier: {
          type: "harness",
          script: "weight-quantizer",
          metrics: {
            improvement_over_per_tensor: { op: ">=", value: 3 },
            logit_rmse: { op: "<=", value: 1 },
          },
        },
      },
      {
        id: "quant-sensitivity",
        title: "Run a per-layer quantization sensitivity analysis",
        kind: "bench",
        xp: 90,
        detail:
          "MIT 6.5940-style: quantize one layer (or group) at a time, measure the damage, and let the scan choose where precision goes — before reaching for uniform recipes.",
      },
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
    briefing: [
      "The Anatomy post is the closest thing to a textbook chapter on a production engine, and the task's V1 warning is load-bearing: the internet is thick with V0-era posts describing a scheduler that no longer exists, and repeating them in an interview is a tell. The request-trace task is the real work of this quest — writing down every file and class one request touches is the difference between “has used vLLM” and “has read it,” and it's the exact preparation for landing PRs in the Arena phase.",
      "When you tune your deployment, one-knob-at-a-time with a results table isn't pedantry: several knobs interact (chunked-prefill budget against prefix-cache hit rate, quantized KV against batch capacity), and the table of what each did on your hardware is both how you'll genuinely understand them and a good interview artifact in its own right.",
    ],
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
        title: "Deploy vLLM on your fleet and tune it",
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
    briefing: [
      "SGLang earns co-billing because job postings list it as vLLM's equal and because RadixAttention is a genuinely different idea: the KV cache as a prefix tree shared across requests, which turns multi-turn and agentic traffic — everyone's traffic now — into a cache-hit problem. The methodology reading sits before the head-to-head on purpose: most published LLM benchmarks are subtly wrong, usually through unrealistic length distributions or a single conflated latency number, and the goal of this quest is to make you incapable of producing one of those.",
      "Report the head-to-head as Pareto curves with TTFT and ITL separated, and goodput at a stated SLO — a bare tokens/sec claim with no latency constraint is the field's most common lie. That framing carries straight into the observability phase, and the published post at the end is the artifact a laptop-bound candidate cannot fake: your numbers, your hardware, reproducible configs.",
    ],
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
        title: "Learn benchmark methodology: NVIDIA's guide + AIPerf",
        kind: "read",
        xp: 80,
        link: "https://docs.nvidia.com/nim/benchmarking/llm/latest/index.html",
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
  {
    id: "serving-surface",
    title: "The Serving Surface",
    tagline: "Where production bugs actually live: templates, tools, adapters, modalities.",
    phaseId: "p6",
    prereqs: ["vllm-deep"],
    briefing: [
      "This is the least glamorous quest on the map and the one most correlated with being useful on day one: templates, tool parsing, and adapter management are where production incidents actually come from. Take the render-by-hand-and-diff exercise seriously — a chat-template mismatch doesn't error, it silently degrades quality, which makes it the worst class of bug to find. Tool calling is the same story one layer up: model-specific markup turned into OpenAI tool_calls JSON by per-model parsers, streaming deltas included, and every parser is a place things break.",
      "The multi-LoRA and multimodal tasks are here to break the one-model-one-server mental model — batched adapters share a base, and an embedding server is a different serving profile entirely (no KV cache, latency-critical). The security task's prefix-cache timing side channel is worth the read on its own: a shared cache leaks whether someone else's prompt shared your prefix, which is why cache salting exists. Raising that unprompted reads as senior in a design interview.",
    ],
    tasks: [
      {
        id: "surf-templates",
        title: "Master chat templates: Jinja, generation prompts, assistant & reasoning prefill",
        kind: "read",
        xp: 80,
        link: "https://huggingface.co/docs/transformers/main/en/chat_templating",
        detail:
          "Template mismatch is a top source of silent quality regressions. Render a template by hand for one model and diff it against apply_chat_template.",
      },
      {
        id: "surf-tools",
        title: "Learn tool/function-calling in servers: parsers, tool_choice, streaming deltas",
        kind: "read",
        xp: 70,
        link: "https://docs.vllm.ai/en/latest/features/tool_calling.html",
        detail:
          "How model-emitted markup becomes OpenAI tool_calls JSON — per-model parsers (hermes/llama/mistral), and where they break. Skim MCP as the emerging layer above.",
      },
      {
        id: "surf-reasoning",
        title: "Serve a reasoning model: thinking parsers, budgets, test-time compute",
        kind: "build",
        xp: 90,
        link: "https://docs.vllm.ai/en/latest/features/reasoning_outputs.html",
        detail:
          "Deploy one reasoning model on your fleet: separate reasoning_content, cap thinking budgets, and measure what long decodes do to your ITL and cost math.",
      },
      {
        id: "surf-lora",
        title: "Deploy multi-LoRA serving: many fine-tunes, one base model",
        kind: "build",
        xp: 120,
        link: "https://docs.vllm.ai/en/latest/features/lora.html",
        detail:
          "S-LoRA/LoRAX-lineage batched adapters. Serve ≥2 adapters on one vLLM instance, hot-load a third, and check adapters appear in /v1/models.",
      },
      {
        id: "surf-multimodal",
        title: "Serve beyond text: a VLM and an embedding/reranker model",
        kind: "build",
        xp: 100,
        link: "https://docs.vllm.ai/en/latest/features/multimodal_inputs.html",
        detail:
          "Image inputs via content parts (encoder scheduling + image-token budgets), plus a TEI-style embedding server — a different serving profile: no KV cache, latency-critical.",
      },
      {
        id: "surf-security",
        title: "Secure the endpoint: auth, cache side channels, prompt injection",
        kind: "read",
        xp: 60,
        link: "https://docs.vllm.ai/en/latest/features/automatic_prefix_caching/",
        detail:
          "API keys (and what stays unauthenticated: /health, /metrics), prefix-cache timing side channels + cache salting, and a guardrails/prompt-injection primer for the gateway layer.",
      },
    ],
  },

  // ═════════════════════ Phase 7 — Distributed Inference ═════════════════════
  {
    id: "parallelism",
    title: "Parallelism",
    tagline: "TP, PP, EP — and the math of when each wins.",
    phaseId: "p7",
    paths: ["inference", "training"],
    prereqs: ["vllm-deep"],
    briefing: [
      "“How To Scale Your Model” is the best thing written on this subject, and the inference chapter is why the quest exists — it's TPU-flavored, but the communication math transfers to NVLink unchanged. Megatron is the concrete instantiation: column-parallel then row-parallel means one all-reduce per attention block and one per MLP, and knowing exactly where those land is what the drill (and interviews) test. TP versus PP is an interconnect-bandwidth question with a numeric answer, not a preference.",
      "The ring all-reduce build looks like a toy and isn't: reduce-scatter plus all-gather over point-to-point sends is the algorithm inside NCCL, and implementing it once is how bandwidth-optimal collectives stop being folklore. The scaling measurement completes the argument — TP=2 will not give you 2×, and the decomposed explanation of why, per-layer all-reduce cost against your actual interconnect, is the lesson rather than the disappointment.",
    ],
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
        id: "par-collectives",
        title: "Read the collectives crash course + compute/communication overlap math",
        kind: "read",
        xp: 60,
        link: "https://huggingface.co/spaces/nanotron/ultrascale-playbook",
        detail: "Ultra-Scale Playbook appendices A0 and A3 — the analytical grounding under everything in this phase.",
      },
      {
        id: "par-allreduce-harness",
        title: "Pass the grader: ring all-reduce from scratch",
        kind: "build",
        xp: 200,
        detail:
          "Reduce-scatter + all-gather over point-to-point send/recv across 4 processes (CPU, gloo — no fleet needed). Collectives are monkeypatched to raise, so the ring is yours. Three peer courses grade exactly this before letting students near NCCL.",
        verifier: {
          type: "harness",
          script: "ring-allreduce",
          metrics: { max_abs_err: { op: "<=", value: 1e-4 } },
        },
      },
      {
        id: "par-megatron-impl",
        title: "Implement Megatron TP by hand on your toy GPT",
        kind: "build",
        xp: 150,
        detail:
          "Shard your Phase 1 GPT's attention + MLP column/row-parallel across 2+ processes, placing the f/g all-reduces yourself (torch.distributed, CPU is fine). Logits must match single-process.",
      },
      {
        id: "par-tp-run",
        title: "Run TP≥2 on your fleet and measure scaling efficiency",
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
    briefing: [
      "DistServe supplies the frame the industry adopted: colocated prefill and decode contaminate each other's latency, so split them and optimize each against its own SLO — “goodput per GPU” is the phrase that survived. Mooncake is the proof at production scale, with the further idea that the KV cache is the center of the architecture, tiered across DRAM and SSD. The LMSYS expert-parallelism writeup is the single best account of modern MoE serving, and it's what makes the TP-vs-EP build meaningful: implement both, find the crossover, and the all-to-all pattern from the MoE papers becomes muscle memory.",
      "The infrastructure survey — Dynamo, NIXL, LMCache, llm-d — is here because KV movement grew into a subsystem with job requisitions attached; be able to say what each piece does in one sentence. Same logic for the Kubernetes task: KV-aware load balancing is a GA gateway primitive now, and the K8s layer has stopped being someone else's problem.",
    ],
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
        id: "dis-moe-impl",
        title: "Implement TP-MoE and EP-MoE, then benchmark the crossover",
        kind: "build",
        xp: 180,
        detail:
          "UCSD CSE 234-style: a sharded-linear expert layer both ways — TP (shard every expert) vs EP (all-to-all token routing) — and measure where each wins. CPU processes are fine; the communication pattern is the lesson.",
      },
      {
        id: "dis-ring",
        title: "Read Ring Attention / context parallelism for long-context inference",
        kind: "paper",
        xp: 60,
        link: "https://arxiv.org/abs/2310.01889",
        detail: "The fourth parallelism axis — vLLM's decode context parallelism is production-real for long-context agents.",
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
    briefing: [
      "This quest is short because the skill is a discipline, not a literature. The vLLM metrics doc tells you what the engine already exports — KV utilization, queue depth, TTFT histograms — and the work is wiring it up so your fleet alerts before OOM, not after. The OTel GenAI conventions are a quick read with a career-shaped reason attached: the standard is young enough that knowing it puts you ahead of most incumbents, and naming conventions are how your observability work stays legible to other teams.",
      "Over-invest in the SLO task: define TTFT/ITL targets, run load, report the percentage of requests meeting both. That's goodput — the DistServe framing made operational — and it appears nearly verbatim in serving-team job postings, Anthropic's included.",
    ],
    tasks: [
      {
        id: "obs-metrics",
        title: "Wire vLLM /metrics into Prometheus + Grafana on your fleet",
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
    briefing: [
      "The tensoreconomics piece is the best published derivation of cost per token from first principles — it connects the bandwidth arithmetic from the KV-cache quest to dollars, a translation most engineers never learn to make. InferenceMAX is the methodology reference: cost claims as Pareto frontiers across hardware with stated assumptions, no single-number cherry-picking. Read it as a template for making a cost claim you'd defend under cross-examination.",
      "Then the capstone: a cost model for the hardware you actually run — amortized hardware and power, through measured throughput, to $/M tokens per model and quantization. Almost nobody walks into an interview with a cost model built from real bills and real measured throughput, which is what makes the write-up at the end one of the strongest artifacts on this roadmap.",
    ],
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
          "Amortized hardware + power → $/M tokens at measured throughput, per model and quantization. This spreadsheet is interview gold.",
      },
      {
        id: "econ-writeup",
        title: "VERIFIED: publish “How I cut my cost per token”",
        kind: "write",
        xp: 250,
        detail: "The cost story with real numbers from your own hardware. Your single best piece of evidence.",
        verifier: {
          type: "url",
          mustContainAny: ["cost", "token", "inference", "gpu"],
          minWords: 800,
        },
      },
    ],
  },
  {
    id: "elasticity",
    title: "Elasticity",
    tagline: "Cold starts, autoscaling signals, and the build-vs-buy math.",
    phaseId: "p8",
    prereqs: ["observability"],
    briefing: [
      "The cold-start task teaches the method that generalizes: measure the whole path — provision, image pull, weight load, engine init — as a stacked bar, then attack the biggest bar. On most stacks that's weight loading, which is why streaming loaders and snapshotting techniques exist. The autoscaling reading has a one-sentence takeaway worth the whole task: CPU/GPU utilization and QPS are the wrong scaling signals for LLM workloads, in-flight concurrency is the right one, and Little's Law is the queueing intuition that says why.",
      "The last two tasks are the architecture-interview layer: serverless-versus-self-hosted crossovers, GPU selection, routing that knows about prefix caches and KV utilization, and the standing fact that offline batch inference is the cheapest tokens you'll ever serve. None of it is deep individually — the skill is having the whole decision tree loaded when a design prompt opens with “you have a spiky workload and a budget.”",
    ],
    tasks: [
      {
        id: "elas-coldstart",
        title: "Measure and attack cold starts: provisioning → image → weights → engine init",
        kind: "bench",
        xp: 120,
        link: "https://modal.com/docs/guide/cold-start",
        detail:
          "Time vLLM vs SGLang from process start to first token on your fleet, break it down by stage, then attack the biggest bar (weight loading, compile time, snapshotting techniques).",
      },
      {
        id: "elas-autoscale",
        title: "Learn autoscaling signals and scale-to-zero for LLM workloads",
        kind: "read",
        xp: 70,
        link: "https://handbook.modular.com/",
        detail:
          "Why CPU/GPU-util and QPS are the wrong signals and in-flight concurrency is the right one; queueing intuition via Little's Law; when scale-to-zero pays.",
      },
      {
        id: "elas-decide",
        title: "Master the deployment decision layer: serverless vs self-hosted vs BYOC, GPU selection",
        kind: "read",
        xp: 80,
        detail:
          "The LLM Inference Handbook's getting-started part: cost crossovers, procurement economics (hyperscaler vs neocloud), and mapping model sizes to GPUs. Standard architecture-interview material.",
      },
      {
        id: "elas-routing",
        title: "Learn the routing & gateway layer: strategies, semantic caching, batch-first economics",
        kind: "read",
        xp: 80,
        detail:
          "Prefix-aware / KV-utilization-aware / PD-aware routing; app-level gateways (LiteLLM-class) with exact + semantic caching; and why offline batch inference is the cheapest tokens you'll ever serve.",
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
    briefing: [
      "The repo allowlist is the hiring-signal list — vLLM above all (Red Hat, which employs much of its core team, literally lists contribution familiarity as a plus), with SGLang and FlashInfer counting equally. The request trace you wrote in vLLM, Deeply is your map here: the best first issues are the ones you can locate in that trace within minutes. Expect the social half — CI, review latency, maintainer taste — to be half the work, and budget patience for it; that isn't friction around the skill, it is the skill.",
      "The three verified PRs escalate deliberately: the first proves you can land anything at all, the second — performance or correctness, benchmark numbers in the description — proves you can do the actual job, and the third turns a data point into a pattern. A hiring manager scanning your GitHub sees exactly that progression, which is why the ladder is shaped this way.",
    ],
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
    briefing: [
      "Everything here is reverse-engineered from real reported loops, and the structural fact to plan around is that they're bimodal: NVIDIA-style rounds still ask timed LeetCode while Baseten/Modal-style rounds hand you practical infrastructure, so drill both — plus the rising buggy-file round, where you get 300 lines with a planted bug in masking or sampling and thirty minutes to find it. The gauntlet quiz's 80% bar is interview calibration, not course calibration; passing it bored is the goal, per the tagline.",
      "Do the design drills literally out loud, alone, timed — the gap between understanding a batching system and narrating one against a clock is exactly what the real round measures. And rehearse the attribution question until it's reflexive: “what percentage of the total improvement came from the thing YOU optimized?” Every speedup claimed in the resume rewrite needs that decomposition ready.",
    ],
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
        id: "gauntlet-sysdesign",
        title: "Pass the system-design scenario drill",
        kind: "quiz",
        xp: 150,
        detail:
          "Seven scenarios distilled from REAL reported prompts: Anthropic's single-GPU batcher and GPU-credit scheduler, Fireworks' multi-tenant SLAs, Baseten's no-thrash autoscaling, Together's 100-model fleet and shared KV cache, the 100K-RPS p99 design. 75% to pass.",
        verifier: { type: "quiz", quizId: "system-design-drill", passPct: 75 },
      },
      {
        id: "gauntlet-design",
        title: "Drill the real system-design prompts out loud",
        kind: "build",
        xp: 100,
        detail:
          "The reported prompts, verbatim: 'Design an inference batching system — one GPU, up to 100 inputs per batch, users waiting' (Anthropic); 'serving path for a 70B under 200ms TTFT on H100' (Fireworks); 'serve 100+ open-source models on shared GPUs' and 'multi-tenant LoRA fine-tuning service' (Together); 'GPU autoscaling on queue depth without thrashing, handling cold starts' (Baseten); '100K QPS with strict p99' (NVIDIA). Whiteboard each in 35 minutes, alone, out loud.",
      },
      {
        id: "gauntlet-rounds",
        title: "Prep the other rounds: DSA coding, practical debugging, behavioral",
        kind: "build",
        xp: 80,
        detail:
          "Real loops are bimodal: NVIDIA still asks LeetCode (reports of 2 hards in 40min) while Baseten/Modal ask practical infra. Drill the infra-flavored classics (interval merging as 'GPU idle windows', DAG cycle detection as 'pod dependencies', LRU cache, rate limiter, beam search against unit tests), practice the rising buggy-file round (Mistral hands you 300 lines with a bug in attention masking/sampling/batching — 30 minutes), and work a question bank (StackScholar's LLM-inference set, github.com/llmgenai/LLMInterviewQuestions).",
      },
      {
        id: "gauntlet-resume",
        title: "Rewrite the resume around inference — with attributed numbers",
        kind: "write",
        xp: 100,
        detail:
          "Fleet ops, verified endpoints, cost-per-token wins, merged PRs, published benchmarks, harness receipts. Cut everything else. Then rehearse the attribution drill: NVIDIA asks 'what percentage of the total improvement came from the specific thing YOU optimized?' — know the decomposition of every speedup you claim.",
      },
    ],
  },
  {
    id: "the-offer",
    title: "The Offer",
    tagline: "Convert the work into the title.",
    phaseId: "p9",
    prereqs: ["open-source-arena", "interview-gauntlet"],
    briefing: [
      "The archetype ordering in the target list is deliberate: engine, platform, and field teams hire against exactly the artifacts this roadmap produced — verified endpoints, benchmark posts, merged PRs, a cost model from your own fleet — while kernel-specialist roles want a deeper Phase 4 portfolio, so they wait until those artifacts are strong. Apply in batches rather than serially: loops run for weeks, and parallel processes are offer leverage at the end.",
      "Treat the first loop as a calibration exercise you expect to fumble. Write down every question you couldn't nail and feed it back into the gauntlet before the loops you actually care about — that feedback cycle, not any single prep session, is what converts the work into the title.",
    ],
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

  // ═══════════════ MODEL TRAINING PATH ═══════════════
  // ─────────── Training Phase 1 — Learning to Learn ───────────
  {
    id: "backward-pass",
    title: "The Backward Pass",
    tagline: "Gradients, optimizers, and a loop that converges.",
    phaseId: "t1",
    paths: ["training"],
    prereqs: ["gpt-from-scratch"],
    briefing: [
      "You built the forward pass in Phase 1; this quest is the other half, and it's anchored on Stanford CS336 because that course is the strongest from-scratch training curriculum in the open — its first assignment is essentially this quest with a grader. Backprop by hand isn't nostalgia: deriving the attention and cross-entropy gradients yourself, then checking against autograd, is the difference between using an optimizer and understanding one — and backprop-from-scratch is a reported ML-fundamentals round at OpenAI.",
      "The AdamW-from-scratch task exists because the optimizer state is where training memory actually goes (two moments per parameter — the arithmetic that makes ZeRO necessary later), and the schedule details — warmup, cosine decay, gradient clipping — are exactly the knobs you'll watch when a run diverges. Finish with mixed precision measured, not assumed: bf16 autocast is the unquestioned default, and knowing what it does to throughput and loss on your own hardware is the habit this whole path drills.",
    ],
    tasks: [
      {
        id: "bp-cs336",
        title: "Watch CS336's opening lectures and read the Assignment 1 spec",
        kind: "watch",
        xp: 60,
        link: "https://cs336.stanford.edu/",
        detail:
          "Stanford's Language Modeling from Scratch (Spring 2026) — public lectures and assignments. Assignment 1 is the reference target for this quest.",
      },
      {
        id: "bp-manual-grad",
        title: "Derive and implement backprop through attention + cross-entropy by hand",
        kind: "build",
        xp: 120,
        detail:
          "On paper first, then in code without autograd; verify gradients against torch.autograd.gradcheck-style comparisons. A reported OpenAI ML-fundamentals interview round, verbatim.",
      },
      {
        id: "bp-adamw",
        title: "Implement AdamW + warmup-cosine schedule + gradient clipping from scratch",
        kind: "build",
        xp: 100,
        link: "https://arxiv.org/abs/1711.05101",
        detail:
          "No torch.optim. Train your Phase-1 GPT on TinyStories with it. Count the optimizer-state bytes per parameter — that number is why ZeRO exists.",
      },
      {
        id: "bp-mixed-precision",
        title: "Turn on bf16 mixed precision and measure what it buys",
        kind: "bench",
        xp: 60,
        link: "https://arxiv.org/abs/1710.03740",
        detail:
          "Autocast your loop, compare throughput and final loss vs fp32, and know why bf16 doesn't need the loss-scaling dance fp16 did.",
      },
      {
        id: "bp-first-convergence",
        title: "Pass the grader: first convergence on a fixed token budget",
        kind: "build",
        xp: 150,
        detail:
          "The harness owns the workload — a ~1M-param GPT with fixed init on a synthetic corpus with a known entropy floor — and YOUR loop (your optimizer, your schedule) must reach the calibrated val-loss band on exactly one pass of the 1M-token budget. Token budgets, not wall-clock: any GPU passes in under a minute, CPU in ~10.",
        verifier: {
          type: "harness",
          script: "first-convergence",
          metrics: { val_loss: { op: "<=", value: 2.0 } },
        },
      },
    ],
  },
  {
    id: "feeding-the-beast",
    title: "Feeding the Beast",
    tagline: "Data quality is a research problem — the job postings say so verbatim.",
    phaseId: "t1",
    paths: ["training"],
    prereqs: ["backward-pass"],
    briefing: [
      "The FineWeb blogpost is the central text here not for the dataset but for the method: every filtering decision ablated with real training runs, which is what “data quality as a research problem” (OpenAI's posting language) actually looks like in practice. Its counterintuitive findings are the value — per-snapshot dedup beat global dedup, and more aggressive cleaning is not monotonically better. DCLM matters as the benchmark formulation and the origin of the CORE metric you'll meet again in evals.",
      "The pipeline build is the employable skill: run a real Common Crawl slice through datatrove's extract → filter → dedup stages and report what each stage kills. And TinyStories is the cheapest profound result in the field — restrict the data distribution and coherent English emerges in models a thousandth the size — which is the intellectual ancestor of the whole synthetic-data arc (Cosmopedia → SYNTH) now feeding production small models.",
    ],
    tasks: [
      {
        id: "feed-fineweb",
        title: "Read the FineWeb blogpost end to end — ablations included",
        kind: "read",
        xp: 80,
        link: "https://huggingface.co/spaces/HuggingFaceFW/blogpost-fineweb-v1",
        detail:
          "The methodology is the content: how each filter and dedup decision was validated with training runs, and which intuitive cleanups turned out to hurt.",
      },
      {
        id: "feed-dclm",
        title: "Read DCLM: the data-curation benchmark and the CORE metric",
        kind: "paper",
        xp: 60,
        link: "https://arxiv.org/abs/2406.11794",
        detail:
          "Fixed token pool, fixed training recipe, curation as the only variable — plus the low-noise CORE eval used by nanochat and the speedruns.",
      },
      {
        id: "feed-pipeline",
        title: "Build a real curation pipeline over a Common Crawl slice",
        kind: "build",
        xp: 150,
        link: "https://github.com/huggingface/datatrove",
        detail:
          "datatrove: extraction → Gopher/C4 quality filters → MinHash dedup. Report document survival rates per stage and inspect what died — the inspection is the skill.",
      },
      {
        id: "feed-tinystories",
        title: "Read TinyStories, then run the experiment yourself",
        kind: "paper",
        xp: 70,
        link: "https://arxiv.org/abs/2305.07759",
        detail:
          "Train your loop on TinyStories vs a same-budget raw-web sample and compare generations. Then skim the synthetic-data arc: Cosmopedia → SYNTH.",
      },
      {
        id: "feed-quiz",
        title: "Pass the data curation drill",
        kind: "quiz",
        xp: 80,
        detail: "Dedup, filtering rules, FineWeb-Edu's classifier, CORE, synthetic data. 75% to pass.",
        verifier: { type: "quiz", quizId: "data-curation-drill", passPct: 75 },
      },
    ],
  },
  {
    id: "the-recipe",
    title: "The Recipe",
    tagline: "Scaling laws are the interview math of the training world.",
    phaseId: "t1",
    paths: ["training"],
    prereqs: ["backward-pass"],
    briefing: [
      "Chinchilla plus the Epoch replication is the assigned pair because the replication is how you learn to read scaling-laws papers critically — it corrected the original's parametric fit and strengthened the ~20-tokens-per-parameter headline. Then Beyond Chinchilla-Optimal breaks the spell: once you serve a model at volume, compute-optimal is the wrong target, and training small models far past it (SmolLM3: 3B parameters, 11.2T tokens) is the industry default. Being able to argue both sides with arithmetic is precisely what xAI lists as a basic qualification.",
      "The Smol Training Playbook is the modern synthesis — the SmolLM team's actual decisions with their reasoning — and the closest thing to shadowing a pretraining team. μP is deliberately framed as the optional deep end: know what hyperparameter transfer buys and who uses it, and know that the flagship open recipes mostly don't. The drill at the end is pure arithmetic, like the KV-cache math on the other path: 6ND, token budgets, epoch limits, precision effects.",
    ],
    tasks: [
      {
        id: "recipe-chinchilla",
        title: "Read Chinchilla and the Epoch replication together",
        kind: "paper",
        xp: 70,
        link: "https://arxiv.org/abs/2203.15556",
        detail:
          "Then the replication (arxiv.org/abs/2404.10102) — how the Approach-3 fit was corrected, and why ~20 tokens/param survived the audit.",
      },
      {
        id: "recipe-overtraining",
        title: "Read Beyond Chinchilla-Optimal: inference-aware scaling",
        kind: "paper",
        xp: 50,
        link: "https://arxiv.org/abs/2401.00448",
        detail:
          "Why deployable small models train 100×+ past compute-optimal — Llama 3 8B at ~1,875 tok/param, SmolLM3 at ~3,700.",
      },
      {
        id: "recipe-smol-playbook",
        title: "Read The Smol Training Playbook",
        kind: "read",
        xp: 100,
        link: "https://huggingface.co/spaces/HuggingFaceTB/smol-training-playbook",
        detail:
          "The SmolLM team's decision log for building world-class small models: architecture, data mixture, schedule — with reasons attached.",
      },
      {
        id: "recipe-precision",
        title: "Read Scaling Laws for Precision",
        kind: "paper",
        xp: 50,
        link: "https://arxiv.org/abs/2411.04330",
        detail:
          "Low-precision training as an effective-parameter discount — and the finding that overtrained models quantize worse afterward, which ties back to Precision Games.",
      },
      {
        id: "recipe-mup",
        title: "Learn what μP buys: hyperparameter transfer (optional deep end)",
        kind: "paper",
        xp: 50,
        link: "https://arxiv.org/abs/2203.03466",
        detail:
          "Tune on a small proxy, transfer the LR to the big run. Know the idea and its successors (u-μP, CompleteP) — and that most flagship open recipes ship without it.",
      },
      {
        id: "recipe-quiz",
        title: "Pass the scaling-laws drill",
        kind: "quiz",
        xp: 80,
        detail: "6ND arithmetic, Chinchilla vs overtraining, epochs on limited data, precision effects. 75% to pass.",
        verifier: { type: "quiz", quizId: "scaling-laws-drill", passPct: 75 },
      },
    ],
  },

  // ─────────── Training Phase 2 — The Speedrun ───────────
  {
    id: "go-faster",
    title: "Go Faster",
    tagline: "The modded-nanoGPT lineage: 45 minutes to 74 seconds, one trick at a time.",
    phaseId: "t2",
    paths: ["training"],
    prereqs: ["the-recipe", "triton-track"],
    briefing: [
      "The NanoGPT speedrun is this path's Boehm worklog: 89 records that turned 45 minutes of GPT-2 training into 74 seconds, each one a named, measured technique — and its biggest export, Muon, went from speedrun trick to torch.optim to training Kimi K2 at a trillion parameters. Read the record history as a method, then earn the ideas by A/B-ing Muon against your own AdamW: the speedrun's discipline (one change, measured, statistically defended) is the actual curriculum.",
      "The skeptic's paper is assigned right next to the hype on purpose: under fair tuning, most claimed 2× optimizer speedups shrink to ~1.1× at even modest scale — hold both facts at once. The capstone milestone is the same discipline pointed at your own loop: make it measurably faster without losing loss, graded as a same-device A/B so your hardware doesn't matter.",
    ],
    tasks: [
      {
        id: "fast-speedrun-study",
        title: "Study the NanoGPT speedrun record history",
        kind: "read",
        xp: 80,
        link: "https://github.com/KellerJordan/modded-nanogpt",
        detail:
          "All 89 records and what each changed: Muon, QK-norm, ReLU², untied embeddings, FP8 matmuls, window schedules. The method matters more than any single trick.",
      },
      {
        id: "fast-muon",
        title: "Implement Muon and A/B it against your AdamW",
        kind: "build",
        xp: 120,
        link: "https://kellerjordan.github.io/posts/muon/",
        detail:
          "Newton-Schulz orthogonalization on the momentum of 2D weights; embeddings/head stay on AdamW. It ships in PyTorch 2.13 as torch.optim.Muon — implement it first, then check yours against the real one.",
      },
      {
        id: "fast-kernels",
        title: "Adopt Liger kernels + sequence packing, measure the delta",
        kind: "bench",
        xp: 80,
        link: "https://github.com/linkedin/Liger-Kernel",
        detail:
          "Fused RMSNorm/RoPE/CE Triton kernels (~20% throughput, big memory cuts) and FlashAttention-2 document-masked packing. Measure, don't trust the README.",
      },
      {
        id: "fast-fp8",
        title: "Try FP8 training with torchao and know when it pays",
        kind: "bench",
        xp: 60,
        link: "https://github.com/pytorch/ao",
        detail:
          "float8 matmuls compose with torch.compile and FSDP2 (1.3–1.5× on real pretraining). On consumer GPUs support varies — knowing where it does and doesn't apply is the point.",
      },
      {
        id: "fast-skeptic",
        title: "Read “Fantastic Pretraining Optimizers and Where to Find Them”",
        kind: "paper",
        xp: 50,
        link: "https://arxiv.org/abs/2509.02046",
        detail:
          "The reality check: under fair tuning, matrix-preconditioner gains shrink toward 1.1× as models grow. Speedrun claims need this next to them.",
      },
      {
        id: "fast-m3",
        title: "Pass the grader: train ≥1.5× faster than the baseline, loss-matched",
        kind: "build",
        xp: 200,
        detail:
          "The harness trains its own plain fp32 AdamW baseline on a fixed 1M-token workload, then times YOUR loop on an identical model and budget — same device, so any GPU can pass. ≥1.5× wall-clock with final val loss within 0.05 nats. compile, bf16, fused optimizers, Muon — earn it however you like.",
        verifier: {
          type: "harness",
          script: "train-speedup",
          metrics: {
            speedup: { op: ">=", value: 1.5 },
            loss_gap: { op: "<=", value: 0.05 },
          },
        },
      },
    ],
  },
  {
    id: "many-gpus",
    title: "Many GPUs, One Model",
    tagline: "DDP, ZeRO, FSDP2 — what training adds to the parallelism you already know.",
    phaseId: "t2",
    paths: ["training"],
    prereqs: ["backward-pass", "parallelism"],
    briefing: [
      "You already built ring all-reduce and Megatron TP in the shared Parallelism quest; this quest adds what's training-specific. Data parallelism looks trivial (average the gradients) until you build real DDP: gradient bucketing and overlapping communication with the still-running backward pass are where the actual engineering lives, and building it from your own ring all-reduce closes the loop on that whole arc.",
      "ZeRO is the memory argument you set up in The Backward Pass made structural: optimizer state, gradients, and parameters sharded in three stages — and FSDP2 is its PyTorch-native present, with torchtitan as the reference open stack that shows how FSDP2, TP, and float8 compose in a real pretraining codebase. The Ultra-Scale Playbook is the text that holds it all together; read it end to end here even though you met its appendices earlier.",
    ],
    tasks: [
      {
        id: "mg-ddp",
        title: "Build DDP from scratch on your ring all-reduce",
        kind: "build",
        xp: 150,
        detail:
          "Gradient buckets, comm/compute overlap with backward hooks, 2–4 CPU processes (gloo). Logits must match single-process training — same bar as the Megatron task.",
      },
      {
        id: "mg-zero",
        title: "Read ZeRO, then shard your loop with FSDP2",
        kind: "build",
        xp: 100,
        link: "https://arxiv.org/abs/1910.02054",
        detail:
          "The three sharding stages and their memory math, then fully_shard on your model. Verify the per-rank memory drop matches the arithmetic.",
      },
      {
        id: "mg-titan",
        title: "Read torchtitan: the reference open pretraining stack",
        kind: "read",
        xp: 60,
        link: "https://github.com/pytorch/torchtitan",
        detail:
          "How FSDP2 + TP + PP + float8 compose in one production-shaped codebase. The training-side analog of reading nano-vllm.",
      },
      {
        id: "mg-ultrascale",
        title: "Read the Ultra-Scale Playbook end to end",
        kind: "read",
        xp: 100,
        link: "https://huggingface.co/spaces/nanotron/ultrascale-playbook",
        detail:
          "5D parallelism, ZeRO, kernels, and the comm/compute overlap math — the training analog of the scaling book, and the interview text for training-infra roles.",
      },
    ],
  },
  {
    id: "the-124m",
    title: "The 124M",
    tagline: "Pretrain a real GPT-2. Yours. On your hardware or fifty dollars.",
    phaseId: "t2",
    paths: ["training"],
    prereqs: ["go-faster", "feeding-the-beast"],
    briefing: [
      "This is the Paul Graham artifact made literal: a GPT-2-class model, trained by you, as good as you can make it on the cheapest hardware you can get. nanochat is the blueprint (Karpathy's ~$100 full stack; its leaderboard drove time-to-GPT-2 from OpenAI's 168 hours to 1.65), and llm.c's discussions carry the cost math. Both honest routes are first-class here: ~$50 of rented 8×H100 time, or a multi-day run on your own card — ~28 hours on a 4090, a patient week on smaller — with checkpoint/resume discipline doing the work a cluster babysitter would.",
      "Write the run plan before you spend a token: data shard, config, token budget, checkpoint cadence, cost both ways. That document is the difference between training a model and having trained one — and the public worklog at the end is the genre (per the speedrun-to-OpenAI pipeline) that training-side hiring actually reads.",
    ],
    tasks: [
      {
        id: "capstone-nanochat",
        title: "Read nanochat's speedrun script and the “Beating GPT-2 for <<$100” thread",
        kind: "read",
        xp: 80,
        link: "https://github.com/karpathy/nanochat",
        detail:
          "The full pipeline in one hackable repo, and the community discussions where the real cost/quality tradeoffs live — including single-5090 runs.",
      },
      {
        id: "capstone-plan",
        title: "Write the run plan: data, config, budget, checkpoints, cost",
        kind: "write",
        xp: 60,
        detail:
          "FineWeb-Edu shard choice, model config, token budget vs the scaling math from The Recipe, checkpoint cadence, and the cost estimate for both routes (own GPU vs rented node).",
      },
      {
        id: "capstone-train",
        title: "CAPSTONE: pretrain your 124M-class model on ~10B tokens",
        kind: "build",
        xp: 400,
        detail:
          "To the GPT-2 loss band, with resumable checkpoints and full telemetry kept. Auto-verifier (loss band + downstream probe + checkpoint chain) is in calibration — this converts to the path's flagship graded milestone.",
      },
      {
        id: "capstone-writeup",
        title: "VERIFIED: publish the pretraining worklog",
        kind: "write",
        xp: 200,
        detail:
          "The run plan, the curves, what broke, what it cost, and honest evals. The training-side analog of the kernel worklog — a known door-opener.",
        verifier: {
          type: "url",
          mustContainAny: ["pretrain", "gpt-2", "fineweb", "val loss", "tokens"],
          minWords: 800,
        },
      },
    ],
  },

  // ─────────── Training Phase 3 — Post-Training ───────────
  {
    id: "teach-it-to-chat",
    title: "Teach It to Chat",
    tagline: "Base model → assistant: SFT, LoRA, DPO on one consumer GPU.",
    phaseId: "t3",
    paths: ["training"],
    prereqs: ["backward-pass"],
    briefing: [
      "Deliberately reachable without the pretraining capstone: post-training starts from open base models, and it's where the most jobs are. TRL v1.0 is the stack — its 2026 shape is itself a lesson (SFT/DPO/GRPO/Distillation stable, PPO demoted to experimental). “LoRA Without Regret” is the modern citation that changed default practice: adapters on all layers including MLPs at ~10× the full-FT learning rate match full fine-tuning for post-training workloads, which is what makes one consumer GPU a legitimate post-training rig.",
      "Read LIMA critically — its thousand-example minimalism is true for style and format, not for capabilities (reasoning SFT uses six-figure trace counts). DPO survives as the preference stage in every serious open recipe (Tulu 3, OLMo 3) while RL owns capabilities — that division of labor is a favorite interview probe. The chat-template rigor from the serving path applies here in reverse: you're now the one whose template bugs everyone else inherits.",
    ],
    tasks: [
      {
        id: "chat-trl-sft",
        title: "SFT a small open base model with TRL, template done right",
        kind: "build",
        xp: 100,
        link: "https://huggingface.co/docs/trl/sft_trainer",
        detail:
          "SmolLM-class base, a real instruct dataset, the chat template applied and hand-verified (render one example yourself and diff it). Compare before/after generations.",
      },
      {
        id: "chat-lora",
        title: "Read LoRA + QLoRA + “LoRA Without Regret”, then fine-tune on one GPU",
        kind: "build",
        xp: 120,
        link: "https://thinkingmachines.ai/blog/lora/",
        detail:
          "All layers including MLP, ~10× LR, modest rank — the Thinking Machines recipe. QLoRA (arxiv.org/abs/2305.14314) puts 7B-class fine-tuning inside 8 GB.",
      },
      {
        id: "chat-lima",
        title: "Read LIMA critically",
        kind: "paper",
        xp: 40,
        link: "https://arxiv.org/abs/2305.11206",
        detail:
          "“Quality over quantity” — now understood as true for style/format, false for capabilities. Knowing the 2026 read on it beats knowing the abstract.",
      },
      {
        id: "chat-dpo",
        title: "Run DPO on a preference dataset and eval before/after",
        kind: "build",
        xp: 120,
        link: "https://arxiv.org/abs/2305.18290",
        detail:
          "TRL DPOTrainer on your SFT checkpoint. Understand the implicit-reward derivation well enough to whiteboard it — it gets asked.",
      },
      {
        id: "chat-m5",
        title: "Pass the grader: adapter lift without forgetting",
        kind: "build",
        xp: 200,
        detail:
          "The harness trains its own base model, then hands it to you frozen with a budget of “language B” — 8 tokens the base has never seen. Return a rank-≤8 LoRA (the harness applies it to ITS base): language B must reach the calibrated band while language A regresses ≤0.1. The two lessons are rehearsal and learning-rate discipline — skip either and watch A collapse.",
        verifier: {
          type: "harness",
          script: "adapter-lift",
          metrics: {
            val_loss_b: { op: "<=", value: 1.84 },
            regression: { op: "<=", value: 0.1 },
          },
        },
      },
      {
        id: "chat-nanochat-full",
        title: "Run the full nanochat pipeline end to end at small depth",
        kind: "build",
        xp: 150,
        link: "https://github.com/karpathy/nanochat",
        detail:
          "Tokenizer → pretrain → SFT → chat UI, one repo, small enough to finish. The integrative build: every stage you've now studied, touched in sequence.",
      },
    ],
  },
  {
    id: "reasoning-engine",
    title: "The Reasoning Engine",
    tagline: "RLVR on one GPU — the skill the biggest hiring category wants.",
    phaseId: "t3",
    paths: ["training"],
    prereqs: ["teach-it-to-chat"],
    briefing: [
      "RL post-training is now the largest training-side hiring category (Anthropic alone lists ~10 RL reqs), and GRPO is why it's learnable on your hardware: no value network, no reward model for verifiable tasks — sample groups, score against a checker, normalize within the group. Read the lineage in order (DeepSeekMath invents it, R1 proves it at scale, DAPO/Dr. GRPO/GSPO fix its biases) and then run it: documented setups get reasoning RL from 5 GB of VRAM, and a 0.5B model gains ~10 GSM8K points in an epoch.",
      "The bridge task is the punchline of the whole two-path platform: measure how much of your RL wall-clock is rollout generation — it dominates, which is why TRL runs vLLM inside the trainer and why RL-infra postings require inference skills. Your serving-path knowledge is a hiring edge here, not a detour. On-policy distillation closes the quest because it's the cost/quality frontier for small models: teacher grades student tokens by reverse KL, delivering RL-grade gains at a tenth of the compute.",
    ],
    tasks: [
      {
        id: "rl-grpo-lineage",
        title: "Read the GRPO lineage: DeepSeekMath → R1 → DAPO/Dr. GRPO/GSPO",
        kind: "paper",
        xp: 100,
        link: "https://arxiv.org/abs/2402.03300",
        detail:
          "The algorithm, the scale proof (arxiv.org/abs/2501.12948), then the fixes: DAPO (2503.14476), Dr. GRPO's length-bias correction (2503.20783), GSPO for MoE stability (2507.18071).",
      },
      {
        id: "rl-run",
        title: "Run GRPO on your own GPU and move a benchmark",
        kind: "build",
        xp: 180,
        link: "https://huggingface.co/docs/trl/grpo_trainer",
        detail:
          "TRL or Unsloth, ≤1.5B model, GSM8K-style verifiable tasks. Documented from 5 GB VRAM; log reward curves and watch for length hacking.",
      },
      {
        id: "rl-m6",
        title: "MILESTONE: verified RL lift",
        kind: "build",
        xp: 200,
        detail:
          "≥8–10 point pass@1 lift on a held-out problem split. Auto-verifier (secret 500-problem split, disjoint from public sets) is in calibration — self-check on your own holdout for now.",
      },
      {
        id: "rl-bridge",
        title: "Measure the rollout share of your RL wall-clock",
        kind: "bench",
        xp: 60,
        detail:
          "Instrument a GRPO run: what fraction is generation vs gradient steps? This number is why RL teams hire inference engineers — and why your serving-path skills compound here.",
      },
      {
        id: "rl-distill",
        title: "Read on-policy distillation, then distill a teacher into your model",
        kind: "build",
        xp: 120,
        link: "https://thinkingmachines.ai/blog/on-policy-distillation/",
        detail:
          "Student samples, teacher grades per-token (reverse KL) — RL-grade gains at ~1/10 the compute. TRL's DistillationTrainer is stable; also read Apple's distillation scaling laws (2502.08606).",
      },
    ],
  },

  // ─────────── Training Phase 4 — Proof ───────────
  {
    id: "prove-it",
    title: "Prove It",
    tagline: "Evals are the training world's observability.",
    phaseId: "t4",
    paths: ["training"],
    prereqs: ["teach-it-to-chat"],
    briefing: [
      "Every claim this path produces — the capstone, the adapters, the RL lift — is only as good as its eval, so this quest is the discipline that makes the rest credible. Run both harnesses (lm-eval-harness is the de facto standard; lighteval is what HF's own projects use) on the same model and same benchmark, and let the discrepancies teach you how much implementation details move scores. That lesson generalizes to every leaderboard you'll ever read.",
      "GSM1k is the contamination result to internalize — up to 8-point drops when models meet genuinely fresh problems — and OLMES exists because small base models are especially easy to mis-measure (cloze vs multiple-choice formulation changes rankings). The verified finale is the artifact that matters: a model on the Hub with an honest card, and a writeup whose numbers you can defend. Honest regressions included — same rule as the quantization path, same reason.",
    ],
    tasks: [
      {
        id: "prove-harnesses",
        title: "Run lm-eval-harness AND lighteval on the same model — compare",
        kind: "bench",
        xp: 100,
        link: "https://github.com/EleutherAI/lm-evaluation-harness",
        detail:
          "Same benchmark, both harnesses, note every discrepancy and find its cause (prompt format, few-shot selection, normalization). The discrepancy IS the lesson.",
      },
      {
        id: "prove-contamination",
        title: "Read GSM1k and the decontamination practice around it",
        kind: "paper",
        xp: 50,
        link: "https://arxiv.org/abs/2405.00332",
        detail:
          "Fresh GSM8K-style problems, up to 8-point drops. Then look at how OLMo 3 ships decontamination tooling as part of the release.",
      },
      {
        id: "prove-olmes",
        title: "Read OLMES: how to eval small models without fooling yourself",
        kind: "paper",
        xp: 50,
        link: "https://arxiv.org/abs/2406.08446",
        detail:
          "Cloze vs multiple-choice formulations, curated few-shots — the standardization that makes sub-7B comparisons meaningful. Pair with “The Leaderboard Illusion” (2504.20879).",
      },
      {
        id: "prove-publish",
        title: "VERIFIED: publish your model + an honest eval writeup",
        kind: "write",
        xp: 150,
        detail:
          "Model on the HF Hub with a real card, and a public writeup with the numbers, the methodology, and the regressions. The writeup is URL-verified now; Hub-checking becomes its own verifier later.",
        verifier: {
          type: "url",
          mustContainAny: ["eval", "benchmark", "fine-tun", "lora", "dpo", "grpo"],
          minWords: 600,
        },
      },
    ],
  },

  // ─────────── Training Phase 5 — The Open Ladder ───────────
  {
    id: "open-weights",
    title: "Open Weights, Open Doors",
    tagline: "Merged PRs into the training stack, and the interview drilled boring.",
    phaseId: "t5",
    paths: ["training"],
    prereqs: ["reasoning-engine", "prove-it"],
    briefing: [
      "The allowlist here is the training stack's hiring-signal list: TRL, Unsloth, Axolotl, torchtitan, OLMo-core, datatrove, the eval harnesses, verl, nanochat. The documented precedent is stronger on this path than anywhere: Keller Jordan was hired onto OpenAI pretraining off the NanoGPT speedrun, Maxime Labonne went from open finetunes to shipping Liquid's production models, and training postings at Anthropic, Liquid, and Prime Intellect list open-source contributions as preferred quals or acceptable in lieu of publications. The honest counterweight: another record-holder writes “I don't work in AI” — the artifact opens doors; the interview leg still has to carry you through them.",
      "The drills mirror the reported rounds: backprop live in Python, scaling arithmetic on demand, debugging a diverging run, designing a post-training pipeline (data → SFT → preference → RL → evals). Anthropic interviews in Colab with references allowed and states half its technical staff had no prior ML experience — the bar is what you can do, which is exactly what this path spent five phases building receipts for.",
    ],
    tasks: [
      {
        id: "ow-first-issue",
        title: "Claim and fix a good-first-issue in the training stack",
        kind: "oss",
        xp: 100,
        link: "https://github.com/huggingface/trl/issues?q=is%3Aissue+is%3Aopen+label%3A%22%F0%9F%91%B6+good+first+issue%22",
        detail:
          "TRL, Unsloth, Axolotl, torchtitan, OLMo-core, datatrove, lm-eval — pick the repo whose internals you already walked in this path.",
      },
      {
        id: "ow-pr1",
        title: "VERIFIED: first merged PR in a major training repo",
        kind: "oss",
        xp: 300,
        detail: "Checked live against the GitHub API: exists, merged, non-trivial.",
        verifier: {
          type: "github-pr",
          repoAllowlist: [
            "huggingface/trl",
            "huggingface/transformers",
            "huggingface/datatrove",
            "huggingface/lighteval",
            "unslothai/unsloth",
            "axolotl-ai-cloud/axolotl",
            "pytorch/torchtitan",
            "pytorch/pytorch",
            "allenai/OLMo-core",
            "allenai/open-instruct",
            "EleutherAI/lm-evaluation-harness",
            "volcengine/verl",
            "karpathy/nanochat",
            "KellerJordan/modded-nanogpt",
          ],
        },
      },
      {
        id: "ow-pr2",
        title: "VERIFIED: merged PR with ablation or benchmark numbers",
        kind: "oss",
        xp: 350,
        detail:
          "A training-quality or performance change with measured evidence in the description. Same allowlist, same live verification.",
        verifier: {
          type: "github-pr",
          repoAllowlist: [
            "huggingface/trl",
            "huggingface/transformers",
            "huggingface/datatrove",
            "huggingface/lighteval",
            "unslothai/unsloth",
            "axolotl-ai-cloud/axolotl",
            "pytorch/torchtitan",
            "pytorch/pytorch",
            "allenai/OLMo-core",
            "allenai/open-instruct",
            "EleutherAI/lm-evaluation-harness",
            "volcengine/verl",
            "karpathy/nanochat",
            "KellerJordan/modded-nanogpt",
          ],
        },
      },
      {
        id: "ow-gauntlet",
        title: "Drill the training interview out loud",
        kind: "build",
        xp: 100,
        detail:
          "Backprop from scratch in Python against a clock, 6ND/scaling arithmetic on demand, “this run is diverging — debug it”, and the post-training pipeline design (data → SFT → preference → RL → evals). Timed, alone, spoken.",
      },
      {
        id: "ow-speedrun",
        title: "Attempt a speedrun: NanoGPT record chase or nanochat leaderboard",
        kind: "build",
        xp: 150,
        link: "https://www.gpumode.com",
        detail:
          "A serious attempt at modded-nanogpt's optimization track (hardware-agnostic, step-count-scored) or a nanochat time-to-GPT-2 entry. The artifact channel with the strongest documented precedent.",
      },
      {
        id: "ow-targets",
        title: "Build the training-side target list and apply",
        kind: "build",
        xp: 150,
        detail:
          "From the researched archetypes: RL/post-training first (largest category, lowest experience bar — xAI says “relevant experience is not required”), then pretraining and data roles; frontier labs, Liquid/Zyphra/Prime Intellect, AI2, Apple Foundation Models.",
      },
    ],
  },
];

export const TASKS_BY_ID = new Map(
  QUESTS.flatMap((q) => q.tasks.map((t) => [t.id, t] as const)),
);

export const QUESTS_BY_ID = new Map(QUESTS.map((q) => [q.id, q]));

export const PHASES_BY_ID = new Map(PHASES.map((p) => [p.id, p]));

export const PATHS_BY_ID = new Map(PATHS.map((p) => [p.id, p]));

export function questsForPhase(phaseId: string): Quest[] {
  return QUESTS.filter((q) => q.phaseId === phaseId);
}

/** A quest's path memberships; omitted `paths` means the original path. */
export function questPaths(quest: Quest): PathId[] {
  return quest.paths ?? ["inference"];
}

export function questsForPath(pathId: PathId): Quest[] {
  return QUESTS.filter((q) => questPaths(q).includes(pathId));
}

export function questsForPathPhase(pathId: PathId, phaseId: string): Quest[] {
  return QUESTS.filter(
    (q) => q.phaseId === phaseId && questPaths(q).includes(pathId),
  );
}

/** Display label that disambiguates per-path phase numbering. */
export function phaseLabel(phase: Phase): string {
  return phase.pathId === "training"
    ? `Training Phase ${phase.number}`
    : `Phase ${phase.number}`;
}

/** Shared-trunk (Foundations) quest: belongs to more than one path. */
export function isSharedQuest(quest: Quest): boolean {
  return questPaths(quest).length > 1;
}

/** Phases containing Foundations quests, in inference-path order. */
export const FOUNDATION_PHASE_IDS = PATHS_BY_ID
  .get("inference")!
  .phaseIds.filter((pid) =>
    QUESTS.some((q) => q.phaseId === pid && isSharedQuest(q)),
  );

export function foundationQuestsForPhase(phaseId: string): Quest[] {
  return QUESTS.filter((q) => q.phaseId === phaseId && isSharedQuest(q));
}

/** Quests exclusive to one path within a phase (Foundations excluded). */
export function exclusiveQuestsForPathPhase(
  pathId: PathId,
  phaseId: string,
): Quest[] {
  return QUESTS.filter(
    (q) =>
      q.phaseId === phaseId &&
      !isSharedQuest(q) &&
      questPaths(q)[0] === pathId,
  );
}

export const QUEST_ID_BY_TASK = new Map(
  QUESTS.flatMap((q) => q.tasks.map((t) => [t.id, q.id] as const)),
);

/** Pure unlock rule shared by client UI and API enforcement:
 * a quest unlocks when every prereq quest is at least 50% complete. */
export function isQuestUnlockedFor(
  doneTaskIds: ReadonlySet<string>,
  questId: string,
): boolean {
  const quest = QUESTS_BY_ID.get(questId);
  if (!quest) return false;
  return quest.prereqs.every((pid) => {
    const prereq = QUESTS_BY_ID.get(pid);
    if (!prereq || prereq.tasks.length === 0) return false;
    const done = prereq.tasks.filter((t) => doneTaskIds.has(t.id)).length;
    return done / prereq.tasks.length >= 0.5;
  });
}

export const TOTAL_XP = QUESTS.reduce(
  (sum, q) => sum + q.tasks.reduce((s, t) => s + t.xp, 0),
  0,
);
