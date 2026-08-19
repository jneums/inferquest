import type { CheckResult } from "./verifiers/net";

/**
 * Server-only quiz bank. Answers and explanations never ship to the client
 * bundle — questions are served via /api/quiz/[quizId] with answers stripped,
 * grading happens in /api/verify.
 */
interface QuizQuestion {
  prompt: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
}

export interface Quiz {
  title: string;
  questions: QuizQuestion[];
}

export const QUIZZES: Record<string, Quiz> = {
  "kv-cache-math": {
    title: "KV cache sizing drill",
    questions: [
      {
        prompt:
          "A model has 80 layers, 8 KV heads (GQA), head_dim 128, FP16 KV cache. How much KV cache does ONE token take?",
        choices: ["80 KiB", "160 KiB", "320 KiB", "640 KiB"],
        answerIndex: 2,
        explanation:
          "2 (K and V) × 80 layers × 8 heads × 128 dim × 2 bytes = 327,680 bytes = 320 KiB per token.",
      },
      {
        prompt:
          "Same model. Roughly how much HBM does the KV cache for one 8,192-token sequence need?",
        choices: ["~0.7 GB", "~2.7 GB", "~5.4 GB", "~10.7 GB"],
        answerIndex: 1,
        explanation: "320 KiB × 8,192 ≈ 2.68 GB. This is why long contexts eat GPUs.",
      },
      {
        prompt:
          "Switching that model from FP16 KV to FP8 KV cache does what to max concurrent sequences at a fixed memory budget?",
        choices: ["No change", "≈ 1.4×", "≈ 2×", "≈ 4×"],
        answerIndex: 2,
        explanation:
          "KV bytes halve (2 → 1 byte per value), so roughly twice the sequences fit — modulo weights and activation overhead.",
      },
      {
        prompt:
          "Why does GQA (8 KV heads instead of 64 query heads) matter so much for serving?",
        choices: [
          "It speeds up prefill compute",
          "It shrinks the KV cache 8×, so more sequences fit in memory",
          "It improves model quality",
          "It removes the need for attention kernels",
        ],
        answerIndex: 1,
        explanation:
          "KV cache scales with KV heads, not query heads. 64→8 KV heads is an 8× cache reduction — directly more batch capacity.",
      },
    ],
  },

  "roofline-drill": {
    title: "Roofline & bottleneck drill",
    questions: [
      {
        prompt:
          "An H100 SXM does ~989 TFLOPS (BF16) with ~3.35 TB/s of HBM bandwidth. Its ridge point (arithmetic intensity where compute and bandwidth balance) is roughly:",
        choices: ["~3 FLOP/byte", "~30 FLOP/byte", "~300 FLOP/byte", "~3000 FLOP/byte"],
        answerIndex: 2,
        explanation: "989e12 / 3.35e12 ≈ 295 FLOP per byte. Below that intensity, you're memory-bound.",
      },
      {
        prompt:
          "Single-sequence decode is a matrix-VECTOR workload with arithmetic intensity ≈ 1–2 FLOP/byte. On the H100 above, decode is therefore:",
        choices: [
          "Compute-bound — buy more FLOPS",
          "Memory-bandwidth-bound — every weight byte is read per token",
          "Network-bound",
          "Bound by the Python interpreter",
        ],
        answerIndex: 1,
        explanation:
          "At intensity ~1–2 vs ridge ~295, decode uses <1% of peak FLOPS. Feeding weights from HBM is the limit — hence batching.",
      },
      {
        prompt: "Batching 64 decode requests together primarily helps because:",
        choices: [
          "The GPU clocks higher under load",
          "Weights are read from HBM once per step and reused across all 64 sequences, raising arithmetic intensity",
          "It reduces the KV cache size",
          "It shortens each sequence",
        ],
        answerIndex: 1,
        explanation:
          "Batch turns matrix-vector into matrix-matrix: same weight traffic amortized over 64 tokens → intensity scales with batch size.",
      },
      {
        prompt: "Prefill (processing the whole prompt at once) differs from decode because it is:",
        choices: [
          "Also memory-bound",
          "Compute-bound — large matmuls with high arithmetic intensity",
          "Cache-bound",
          "Identical to decode",
        ],
        answerIndex: 1,
        explanation:
          "Prefill processes all prompt tokens in parallel — big GEMMs, high intensity, compute-bound. That asymmetry drives chunked prefill and P/D disaggregation.",
      },
    ],
  },

  "batching-latency": {
    title: "Batching, latency & SLO drill",
    questions: [
      {
        prompt: "Increasing max batch size on a serving engine generally trades:",
        choices: [
          "Higher throughput for higher per-token latency",
          "Lower throughput for lower latency",
          "Nothing — both improve",
          "Memory for accuracy",
        ],
        answerIndex: 0,
        explanation:
          "Bigger batches amortize weight reads (throughput ↑) but each step does more work, so inter-token latency rises. SLOs pick the operating point.",
      },
      {
        prompt: "Continuous batching (Orca-style) improves on static batching mainly by:",
        choices: [
          "Using bigger batches",
          "Letting requests join/leave the batch at token boundaries instead of waiting for the whole batch to finish",
          "Compressing the KV cache",
          "Skipping the sampler",
        ],
        answerIndex: 1,
        explanation:
          "Static batching wastes GPU time when short requests finish early. Iteration-level scheduling refills those slots immediately.",
      },
      {
        prompt: "TTFT is dominated by ______, while ITL/TPOT is dominated by ______.",
        choices: [
          "decode; prefill",
          "prefill (and queueing); decode",
          "tokenization; detokenization",
          "network; disk",
        ],
        answerIndex: 1,
        explanation:
          "Time-to-first-token = queue + prefill of your prompt. Inter-token latency = decode step time at the current batch size.",
      },
      {
        prompt:
          "A long prompt arrives and stalls everyone's decode for 800ms. Which technique targets exactly this problem?",
        choices: [
          "Speculative decoding",
          "Chunked prefill — split the prompt into pieces interleaved with decode steps",
          "KV cache quantization",
          "Prefix caching",
        ],
        answerIndex: 1,
        explanation:
          "Chunked prefill bounds how long any single prefill can monopolize a step, protecting ITL SLOs for running streams.",
      },
      {
        prompt: "Prefix caching (e.g. RadixAttention) gives its biggest wins when:",
        choices: [
          "Every request is unique",
          "Many requests share a long common prefix (system prompt, few-shot examples, chat history)",
          "Sequences are short",
          "The model is small",
        ],
        answerIndex: 1,
        explanation:
          "Shared prefixes mean the KV for those tokens is computed once and reused — prefill cost for the shared part drops to ~zero.",
      },
    ],
  },
};

QUIZZES["specdec-drill"] = {
  title: "Speculative decoding drill",
  questions: [
    {
      prompt:
        "In Leviathan-style speculative decoding, a draft token with draft probability q and target probability p is accepted with probability:",
      choices: ["p × q", "min(1, p/q)", "max(0, p − q)", "1 if p > 0.5 else 0"],
      answerIndex: 1,
      explanation:
        "Accept with min(1, p/q); on rejection, resample from the normalized residual max(0, p−q). This makes the output distribution EXACTLY the target model's.",
    },
    {
      prompt:
        "With per-token acceptance rate α and draft length k, the expected number of target-model-equivalent tokens per verification step is:",
      choices: ["k × α", "(1 − α^(k+1)) / (1 − α)", "α / k", "k + 1 always"],
      answerIndex: 1,
      explanation:
        "Geometric series over consecutive acceptances (plus the bonus token). At α=0.8, k=4 that's ≈ 3.4 tokens per step.",
    },
    {
      prompt: "Speculative decoding tends to HURT throughput when:",
      choices: [
        "The batch is small and GPUs are idle",
        "The server is already compute-saturated at large batch sizes",
        "The draft model is well-aligned with the target",
        "Sequences are long",
      ],
      answerIndex: 1,
      explanation:
        "Speculation spends extra FLOPs to convert idle compute into latency wins. At high batch occupancy there's no idle compute to spend — verification steals throughput.",
    },
    {
      prompt: "EAGLE improves on a separate draft model mainly by:",
      choices: [
        "Using a bigger draft model",
        "Autoregressing at the feature (hidden-state) level of the target model itself, making drafts cheap and well-aligned",
        "Skipping verification",
        "Quantizing the draft",
      ],
      answerIndex: 1,
      explanation:
        "EAGLE drafts from the target's own top-layer features with a tiny head — higher acceptance than an independent small model, at lower cost.",
    },
  ],
};

QUIZZES["quantization-drill"] = {
  title: "Quantization drill",
  questions: [
    {
      prompt: "AWQ's core idea is:",
      choices: [
        "Second-order (Hessian) error compensation while quantizing weights",
        "Protecting the ~1% of salient weight channels by scaling them, guided by ACTIVATION statistics",
        "Training the model in 4-bit from scratch",
        "Migrating activation outliers into weights",
      ],
      answerIndex: 1,
      explanation:
        "AWQ = activation-aware weight quantization: scale salient channels (found via activations) before quantizing. GPTQ is the Hessian-compensation one; SmoothQuant migrates activation outliers.",
    },
    {
      prompt: "For weight-only 4-bit quantization of a 70B model, weight memory goes from ~140GB (FP16) to roughly:",
      choices: ["~70 GB", "~35 GB", "~17.5 GB", "~9 GB"],
      answerIndex: 1,
      explanation: "4 bits = 0.5 bytes/param → 70e9 × 0.5 ≈ 35 GB (plus scales/zeros overhead).",
    },
    {
      prompt: "Why does FP8 (E4M3) generally beat INT8 for activations in transformers?",
      choices: [
        "It's newer",
        "Floating-point's non-uniform step size absorbs activation outliers better than uniform integer grids",
        "INT8 tensor cores are slower",
        "FP8 needs no scaling factors",
      ],
      answerIndex: 1,
      explanation:
        "Activation distributions are heavy-tailed; FP8's exponent gives dynamic range where INT8's uniform grid clips or wastes precision. (Weights are tamer — INT4/8 works well there.)",
    },
    {
      prompt: "KIVI found that KV cache quantization works best with:",
      choices: [
        "Per-token keys, per-channel values",
        "Per-channel keys, per-token values",
        "Per-tensor everything",
        "No scales at all",
      ],
      answerIndex: 1,
      explanation:
        "Key matrices have strong per-channel outlier structure (RoPE-related); values don't. Hence per-channel K, per-token V.",
    },
    {
      prompt: "NVFP4/MXFP4 differ from plain FP4 by:",
      choices: [
        "Having no sign bit",
        "Block-level scaling factors (e.g. FP8 scale per 16-32 element block) that recover accuracy",
        "Being integer formats",
        "Only working on CPUs",
      ],
      answerIndex: 1,
      explanation:
        "Micro-scaled block formats: a shared scale per small block gives 4-bit storage with near-FP8 accuracy — the Blackwell-era default direction (GPT-OSS ships in MXFP4).",
    },
  ],
};

QUIZZES["parallelism-drill"] = {
  title: "Parallelism drill",
  questions: [
    {
      prompt: "Tensor parallelism inserts collective communication:",
      choices: [
        "Once per request",
        "Once per layer-ish (all-reduce after attention and after MLP), every decode step",
        "Only during prefill",
        "Never — weights are replicated",
      ],
      answerIndex: 1,
      explanation:
        "Megatron-style TP all-reduces activations twice per transformer block, every step — which is why TP wants NVLink and degrades sharply over PCIe or across nodes.",
    },
    {
      prompt: "Pipeline parallelism's main cost in INFERENCE (vs TP) is:",
      choices: [
        "More total memory",
        "Per-token latency: a token must traverse all stages serially, and bubbles waste capacity",
        "It requires MoE models",
        "It can't batch",
      ],
      answerIndex: 1,
      explanation:
        "PP communicates less (activations at stage boundaries) but adds sequential stage latency and bubble inefficiency; it's used across nodes where TP's all-reduces are unaffordable.",
    },
    {
      prompt: "Expert parallelism (MoE) is dominated by which communication pattern?",
      choices: ["All-reduce", "Broadcast", "All-to-all (token routing to experts and back)", "None"],
      answerIndex: 2,
      explanation:
        "Tokens are routed to the GPUs holding their experts and gathered back — all-to-all, twice per MoE layer. DeepEP exists because this is the bottleneck.",
    },
    {
      prompt: "A 70B FP16 model (~140GB weights) on 80GB GPUs needs at minimum:",
      choices: [
        "1 GPU",
        "2 GPUs (TP=2), with KV cache and activations making even that tight",
        "8 GPUs always",
        "It cannot be served without quantization",
      ],
      answerIndex: 1,
      explanation:
        "Weights alone exceed one 80GB card; TP=2 gives 160GB total but leaves only ~20GB for KV across both — why FP8/INT4 or TP=4 is common in practice.",
    },
    {
      prompt: "Prefill/decode disaggregation (DistServe, Mooncake) wins because:",
      choices: [
        "Prefill and decode have opposite resource profiles (compute-bound vs bandwidth-bound) and interfere when colocated",
        "It halves the KV cache",
        "Networks are free",
        "Decode needs no weights",
      ],
      answerIndex: 0,
      explanation:
        "Separating them lets each pool be provisioned and batched for its own bottleneck, at the cost of shipping KV between pools (hence NIXL/Mooncake's transfer engines).",
    },
  ],
};

QUIZZES["interview-gauntlet"] = {
  title: "The interview gauntlet",
  questions: [
    {
      prompt:
        "Llama-70B-style model: 80 layers, 8 KV heads, head_dim 128, FP8 KV. A 32k-token context's KV cache is roughly:",
      choices: ["~1.3 GB", "~5.2 GB", "~10.5 GB", "~21 GB"],
      answerIndex: 1,
      explanation:
        "2 × 80 × 8 × 128 × 1 byte = 160 KiB/token (FP8) → ×32,768 ≈ 5.1 GB.",
    },
    {
      prompt:
        "An 8B FP16 model (~16GB weights) on a GPU with 1 TB/s memory bandwidth. Single-stream decode tokens/sec is bounded near:",
      choices: ["~6 tok/s", "~60 tok/s", "~600 tok/s", "~6000 tok/s"],
      answerIndex: 1,
      explanation:
        "Every token reads all weights once: 1000 GB/s ÷ 16 GB ≈ 62 tok/s ceiling. This is THE canonical bandwidth-bound estimate.",
    },
    {
      prompt: "p50 latency is stable but p99 spiked. The FIRST place to look in a serving system:",
      choices: [
        "The model weights",
        "Queueing + scheduling: long-prompt prefill stalls, preemptions/recomputes, or bursty arrivals filling the batch",
        "The tokenizer",
        "DNS",
      ],
      answerIndex: 1,
      explanation:
        "Tail latency in LLM serving is dominated by scheduling effects — a long prefill monopolizing steps, KV pressure causing preemption, or queue depth. Chunked prefill and admission control are the levers.",
    },
    {
      prompt: "Prefix caching gives near-zero prefill cost when:",
      choices: [
        "temperature=0",
        "Requests share a long common prefix and the KV blocks for it are still resident (hash/radix-matched)",
        "The model is quantized",
        "Batch size is 1",
      ],
      answerIndex: 1,
      explanation: "Shared system prompts/few-shot prefixes hit cached KV blocks; only the unique suffix is prefilled.",
    },
    {
      prompt:
        "You must serve a 70B at <200ms TTFT with spiky traffic. Which combination is the strongest starting design?",
      choices: [
        "One giant batch, static batching, INT4, no streaming",
        "TP within a node for the model, continuous batching with chunked prefill, prefix caching for shared prompts, autoscaled replicas with SLO-aware admission",
        "Pipeline parallelism across regions",
        "CPU offload of the KV cache",
      ],
      answerIndex: 1,
      explanation:
        "TTFT SLO ⇒ prefill capacity + queue control: intra-node TP, iteration-level scheduling with chunked prefill so decode never stalls arrivals, prefix reuse, and replica autoscaling.",
    },
    {
      prompt: "Raising max concurrent sequences (batch) on a memory-tight GPU eventually causes:",
      choices: [
        "Nothing — throughput rises forever",
        "KV-cache pressure → preemption/recompute or swap, tanking tail latency and goodput",
        "Lower power draw",
        "The model to quantize itself",
      ],
      answerIndex: 1,
      explanation:
        "Batch capacity is a KV-memory budget. Past it, the scheduler evicts/recomputes sequences — throughput plateaus while p99 explodes. Goodput, not throughput, is the target.",
    },
    {
      prompt: "In Nsight Compute, a kernel shows 8% SM throughput and 92% DRAM throughput. The right next move is:",
      choices: [
        "Increase occupancy",
        "Reduce bytes moved: better data reuse via shared memory/tiling, fusion, or lower precision — it's bandwidth-bound",
        "Use more registers",
        "Launch more blocks",
      ],
      answerIndex: 1,
      explanation:
        "That profile IS the roofline's memory-bound region. More parallelism won't help; moving fewer bytes will.",
    },
    {
      prompt: "Continuous batching improves GPU utilization over static batching primarily because:",
      choices: [
        "It uses CUDA graphs",
        "Finished sequences' slots are refilled at iteration boundaries instead of waiting for the whole batch",
        "It skips sampling",
        "It reduces model size",
      ],
      answerIndex: 1,
      explanation: "Orca's iteration-level scheduling — the single highest-leverage serving optimization (10-20× in practice).",
    },
  ],
};

export interface PublicQuiz {
  title: string;
  questions: Array<{ prompt: string; choices: string[] }>;
}

export function publicQuiz(quizId: string): PublicQuiz | null {
  const quiz = QUIZZES[quizId];
  if (!quiz) return null;
  return {
    title: quiz.title,
    questions: quiz.questions.map((q) => ({ prompt: q.prompt, choices: q.choices })),
  };
}

export function gradeQuiz(
  quizId: string,
  answers: number[],
  passPct: number,
): { passed: boolean; checks: CheckResult[]; evidence: Record<string, unknown> } {
  const quiz = QUIZZES[quizId];
  if (!quiz) {
    return {
      passed: false,
      checks: [{ name: "quiz", passed: false, detail: "Unknown quiz" }],
      evidence: {},
    };
  }
  const checks: CheckResult[] = quiz.questions.map((q, i) => {
    const given = answers[i];
    const correct = given === q.answerIndex;
    return {
      name: `Q${i + 1}`,
      passed: correct,
      detail: correct
        ? `Correct — ${q.explanation}`
        : `Incorrect (you chose ${given !== undefined && q.choices[given] !== undefined ? `“${q.choices[given]}”` : "nothing"}) — ${q.explanation}`,
    };
  });
  const score = checks.filter((c) => c.passed).length;
  const pct = (score / quiz.questions.length) * 100;
  return {
    passed: pct >= passPct,
    checks,
    evidence: { score, total: quiz.questions.length, pct: Math.round(pct), passPct },
  };
}
