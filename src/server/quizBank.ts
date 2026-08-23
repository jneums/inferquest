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
    {
      prompt:
        "A customer reports TPOT (time per output token) regressing under burst load while off-peak TPOT is fine. What is the FIRST hypothesis to check?",
      choices: [
        "The model weights are corrupted",
        "Batch occupancy: bursts push the running batch (and chunked-prefill share) up, so every decode step does more work — check concurrent-sequence counts, token-budget saturation, and preemption/recompute metrics against the regression timeline",
        "The tokenizer is slow",
        "Network bandwidth to the client",
      ],
      answerIndex: 1,
      explanation:
        "ITL/TPOT is a direct function of per-step batch work. Under burst, more sequences (plus prefill chunks and possible KV-pressure preemptions) share each step — the diagnostic matrix starts with scheduler/batch metrics, not the model.",
    },
    {
      prompt:
        "Nsight Compute shows your kernel at HIGH occupancy but LOW achieved DRAM bandwidth AND low compute throughput. What is it bound by, and what helps?",
      choices: [
        "Memory-bandwidth-bound — reduce bytes moved",
        "Compute-bound — use tensor cores",
        "Latency-bound: plenty of warps exist but they're all stalled on long dependency chains (scoreboard stalls) — increase independent work per thread (ILP), restructure dependencies, or pipeline loads with cp.async/TMA",
        "Occupancy-bound — launch more blocks",
      ],
      answerIndex: 2,
      explanation:
        "When neither ceiling (bandwidth or FLOPs) is approached despite high occupancy, warps are waiting, not working — the third roofline failure mode. More occupancy can't fix stalls that every warp shares; independent instructions can.",
    },
    {
      prompt: "You must replace the serving fleet's model with a new fine-tune without risking production quality. The safest rollout is:",
      choices: [
        "Deploy to all replicas at once during low traffic",
        "Shadow the new model on mirrored traffic (compare outputs/metrics offline), then canary a small live slice behind automatic rollback triggers on quality and latency SLOs, then ramp",
        "A/B test on 50% of traffic immediately",
        "Swap the weights in place on running replicas",
      ],
      answerIndex: 1,
      explanation:
        "Shadow traffic finds regressions without user exposure; the canary bounds blast radius with an automated exit; the ramp catches load-dependent issues. 'Roll out a new model safely' is a standard ops interview question, and this is the expected shape.",
    },
    {
      prompt:
        "Your LLM feature costs $50k/month with p95 latency of 8s, and you're asked to improve BOTH. What is the right first move?",
      choices: [
        "Upgrade to bigger GPUs",
        "Decompose the latency and the bill: measure TTFT vs decode time, tokens per request by type, and cache-hit potential — then apply the targeted lever (prefix caching for shared prompts, quantization for decode, routing small requests to small models, batching for throughput)",
        "Switch providers immediately",
        "Reduce max_tokens for all users",
      ],
      answerIndex: 1,
      explanation:
        "Cost and latency share levers but only after attribution: an 8s p95 dominated by queueing needs capacity/admission, one dominated by long decodes needs faster decode or shorter outputs. Interviewers grade the decomposition step, not the lever list.",
    },
  ],
};

QUIZZES["system-design-drill"] = {
  title: "System-design scenario drill",
  questions: [
    {
      prompt:
        "Anthropic's classic prompt: one GPU processes up to 100 inputs per batch; users wait synchronously. The core batching-policy decision is:",
      choices: [
        "Always wait until 100 inputs are queued to maximize efficiency",
        "Dispatch every request immediately in its own batch to minimize latency",
        "A time-window + size trigger: dispatch when the batch fills OR a small deadline expires — trading a bounded latency cost for amortized throughput, with the window tuned to the arrival rate",
        "Random batching to keep fairness",
      ],
      answerIndex: 2,
      explanation:
        "Waiting for full batches starves users at low traffic; batch-of-one wastes the GPU at high traffic. The dual trigger bounds worst-case added latency while capturing batching wins — and saying how you'd tune the window against arrival rate is what interviewers listen for.",
    },
    {
      prompt:
        "Multi-tenant GPU serving with strict per-customer latency SLAs (Fireworks-style): a noisy neighbor floods requests. What actually protects the other tenants?",
      choices: [
        "Trusting fair CPU scheduling to spread the load",
        "Per-tenant admission control and token-budget scheduling (rate limits at the gateway, per-tenant queue quotas, weighted share of each batch's token budget) — plus isolation tiers (dedicated pools) for the strictest SLAs",
        "Doubling the fleet size",
        "Per-tenant Docker containers on the same GPU",
      ],
      answerIndex: 1,
      explanation:
        "The contended resource is the engine's per-step token budget and KV memory, so protection must operate there: quotas on what enters the queue and weighted scheduling of what enters each batch. Containers don't partition a shared engine's batch; overprovisioning just moves the cliff.",
    },
    {
      prompt:
        "GPU autoscaling that doesn't thrash (Baseten-style): requests are bursty and replicas take ~2 minutes to cold-start. Which design element most directly prevents thrashing?",
      choices: [
        "Scaling on instantaneous GPU utilization for fast reaction",
        "Asymmetric policy with hysteresis: scale up eagerly on sustained in-flight concurrency over a short window, scale down conservatively after a long cooldown — and mask cold starts with a small warm buffer of pre-started replicas",
        "Scaling down immediately when any replica is idle",
        "A fixed replica count sized for peak",
      ],
      answerIndex: 1,
      explanation:
        "Thrash comes from reacting symmetrically to a noisy signal with slow actuators. Asymmetry (fast up, slow down), windowed signals, and warm capacity absorb bursts without oscillation; instantaneous GPU-util is both noisy AND misleading for LLMs.",
    },
    {
      prompt:
        "Serving 100+ open-source models on shared GPU capacity (Together-style): the traffic is a few hot models plus a long tail. The economic core of the design is:",
      choices: [
        "One replica per model, always on",
        "The biggest model hosts all the others via adapters",
        "Round-robin every model across all GPUs",
        "Tiering by traffic: dedicated always-warm pools for hot models, scale-to-zero with fast weight loading for the tail, multiplexed LoRA adapters where fine-tunes share a base — plus per-model routing",
      ],
      answerIndex: 3,
      explanation:
        "Always-on replicas for the tail burn idle GPUs; pure on-demand makes hot models pay cold starts. Traffic-tiered placement with fast-load infrastructure for the tail and adapter multiplexing for fine-tune families is the pattern the serving companies actually run.",
    },
    {
      prompt:
        "A multi-tenant prefix-sharing KV cache (Together-style design prompt): what pairing makes it both efficient and safe?",
      choices: [
        "Share every cached prefix globally and evict LRU",
        "Disable caching for all tenants",
        "Per-tenant cache namespaces (salting) so blocks never cross trust boundaries, with per-tenant memory budgets and LRU/leaf-first eviction inside each namespace — sharing freely only within a tenant's own traffic",
        "Cache only system prompts, never user content",
      ],
      answerIndex: 2,
      explanation:
        "Global sharing leaks via timing side channels and lets one tenant's working set evict another's; no caching wastes the biggest serving win. Salted namespaces plus per-tenant budgets keep the reuse and bound both the leak and the noisy-neighbor eviction.",
    },
    {
      prompt:
        "100K requests/sec token-generation service with strict p99 (NVIDIA/Anthropic-scale prompt): which element does the heavy lifting for the P99 specifically?",
      choices: [
        "Admission control + queue-depth-aware routing with chunked prefill: bound what enters each replica's batch so no step (and no queue) grows unboundedly, and long prompts can't stall running decodes",
        "The biggest possible max batch size for throughput",
        "A single global FIFO queue for fairness",
        "Retrying slow requests on a second replica",
      ],
      answerIndex: 0,
      explanation:
        "Tail latency dies from queueing and step-time variance, not average capacity: caps on queue depth and per-step token budgets plus chunked prefill flatten the step-time distribution. Max-throughput configs actively sacrifice p99; hedged retries double load exactly when you can least afford it.",
    },
    {
      prompt:
        "Anthropic's GPU-credit scheduler prompt: users spend credits for GPU time; the follow-ups probe preemption and monopolization. What design answers both?",
      choices: [
        "First-come-first-served with no preemption — simplest is best",
        "Credit-weighted fair-share scheduling with caps on any single user's concurrent allocation, and checkpoint-preemption of long-running jobs when higher-priority (or starved) work arrives — credits buy share, not unbounded occupancy",
        "Highest-credit-balance user always wins every allocation",
        "Random lottery per GPU-hour",
      ],
      answerIndex: 1,
      explanation:
        "Pure priority lets a rich user monopolize; pure FCFS lets early jobs squat. Fair-share weighted by credits, concurrency caps, and preemption-with-checkpointing is the textbook answer — and the follow-ups (node failure, dynamic pricing) hang naturally off it.",
    },
  ],
};

QUIZZES["scaling-laws-drill"] = {
    title: "Scaling-laws drill",
    questions: [
      {
        prompt:
          "Chinchilla's compute-optimal rule of thumb is ~20 tokens per parameter. Roughly how many training tokens does a 1B-parameter model want under it?",
        choices: ["2B tokens", "20B tokens", "200B tokens", "1T tokens"],
        answerIndex: 1,
        explanation: "20 tokens/param × 1e9 params = 2e10 = 20B tokens.",
      },
      {
        prompt:
          "Using the standard C ≈ 6ND approximation, what does training a 124M-parameter model on 10B tokens cost in FLOPs?",
        choices: ["~7.4e16", "~7.4e18", "~7.4e20", "~1.2e22"],
        answerIndex: 1,
        explanation:
          "6 × 1.24e8 × 1e10 ≈ 7.4e18 FLOPs. The 6 counts forward (2) plus backward (4) FLOPs per parameter per token.",
      },
      {
        prompt:
          "SmolLM3 trained a 3B model on 11.2T tokens — roughly 3,700 tokens/param, ~185× past Chinchilla-optimal. Why is this standard practice rather than a mistake?",
        choices: [
          "Chinchilla was refuted, so token counts no longer matter",
          "Small models can't overfit, so more data is always free",
          "Inference-aware scaling: at high serving volume, overtraining a smaller model minimizes TOTAL cost, because the smaller model is cheaper on every future request",
          "It was a data-availability accident",
        ],
        answerIndex: 2,
        explanation:
          "Beyond Chinchilla-Optimal (Sardana et al.): compute-optimal ignores inference. Amortized over billions of served requests, train-longer-deploy-smaller wins — which is why every deployable small model is heavily overtrained.",
      },
      {
        prompt:
          "Chinchilla's core prescription: given 10× more training compute, how should you scale the model?",
        choices: [
          "10× the parameters, same tokens",
          "10× the tokens, same parameters",
          "Roughly √10 ≈ 3.2× the parameters AND ~3.2× the tokens",
          "It depends only on the learning rate",
        ],
        answerIndex: 2,
        explanation:
          "Parameters and tokens scale roughly equally with compute at the optimum — the whole point of the paper (and what GPT-3-era models got wrong by under-training).",
      },
      {
        prompt:
          "You have a fixed compute budget but only 50B unique tokens — a quarter of what Chinchilla suggests. The data-constrained scaling result (Muennighoff et al.) says:",
        choices: [
          "Stop training when unique data runs out — repeated data is worthless",
          "Repeat the data: up to ~4 epochs, repeated tokens are worth almost as much as fresh ones",
          "Switch to a 10× smaller model",
          "Random synthetic tokens fill the gap equally well",
        ],
        answerIndex: 1,
        explanation:
          "Up to ~4 epochs, the value of repeated data decays only mildly; beyond that, returns diminish sharply. Multi-epoch training on curated data beats single-epoch on junk.",
      },
      {
        prompt: "The practical payoff of μP (maximal update parametrization) is:",
        choices: [
          "It makes training run faster on the same hardware",
          "Hyperparameters (especially LR) tuned on a small proxy model transfer to the large model without re-sweeping",
          "It removes the need for warmup",
          "It guarantees convergence for any learning rate",
        ],
        answerIndex: 1,
        explanation:
          "μP reparametrizes init and per-layer LRs so the optimal LR stays stable across width — tune small, train big once. Successors (u-μP, CompleteP) extend the idea; many flagship open recipes still ship without it.",
      },
      {
        prompt:
          "“Scaling Laws for Precision” (Kumar et al.) found that training a model on MORE tokens makes it:",
        choices: [
          "Easier to quantize afterward — more data means more robustness",
          "Harder to quantize afterward — post-training quantization degrades overtrained models more",
          "Impossible to quantize below 8 bits",
          "Unaffected by quantization",
        ],
        answerIndex: 1,
        explanation:
          "One of the paper's headline results: quantization degradation grows with the token/parameter ratio. Heavily overtrained small models pay a larger quality tax under PTQ — a real tension with inference-aware overtraining.",
      },
    ],
};

QUIZZES["data-curation-drill"] = {
    title: "Data curation drill",
    questions: [
      {
        prompt: "MinHash deduplication, as used in the FineWeb pipeline, is designed to catch:",
        choices: [
          "Exact byte-identical documents only",
          "Near-duplicate documents (same content, small edits/boilerplate differences)",
          "Repeated n-grams inside one document",
          "Documents in the wrong language",
        ],
        answerIndex: 1,
        explanation:
          "MinHash approximates Jaccard similarity over shingles, catching near-duplicates that exact hashing misses — the dominant form of duplication in web crawls.",
      },
      {
        prompt: "FineWeb's dedup ablations reached a counterintuitive conclusion:",
        choices: [
          "Global dedup across all crawl snapshots was strictly best",
          "Dedup doesn't affect model quality at all",
          "Per-snapshot dedup beat global dedup — aggressive global dedup removed good content while what survived skewed worse",
          "Only exact dedup helps; fuzzy dedup always hurts",
        ],
        answerIndex: 2,
        explanation:
          "Globally deduping everything upweighted low-quality residue and threw away useful text; deduplicating within each snapshot trained better models. More cleaning is not monotonically better — that's the blogpost's core lesson.",
      },
      {
        prompt: "FineWeb-Edu was built by:",
        choices: [
          "Keeping only pages from .edu domains",
          "Training a classifier on LLM-annotated educational-quality scores, then keeping high-scoring pages",
          "Manual review of every document",
          "Keeping only pages containing math",
        ],
        answerIndex: 1,
        explanation:
          "Llama-3-70B annotated samples for educational value; a small classifier trained on those labels filtered the corpus (score ≥3 → the 1.3T-token subset). Classifier-based quality filtering is now the standard move.",
      },
      {
        prompt: "Which of these is one of the original C4 cleaning rules?",
        choices: [
          "Drop lines that don't end in terminal punctuation",
          "Drop all documents shorter than 10,000 words",
          "Translate non-English text to English",
          "Remove all proper nouns",
        ],
        answerIndex: 0,
        explanation:
          "C4's heuristics: terminal-punctuation line filter, dropping pages with 'lorem ipsum' or curly braces, the bad-words list. Crude, but still the baseline vocabulary of quality filtering (alongside Gopher's stats-based rules).",
      },
      {
        prompt: "DCLM's CORE metric exists because:",
        choices: [
          "A single benchmark score is too noisy at small scale — CORE averages centered accuracy over a suite of tasks that give clean early signal",
          "MMLU is too easy for small models",
          "It measures training speed, not quality",
          "It's required by law for dataset releases",
        ],
        answerIndex: 0,
        explanation:
          "Small-scale ablations need low-noise, early-signal evals. CORE's centered averaging across many small tasks is that instrument — it's also what nanochat's leaderboard targets.",
      },
      {
        prompt: "TinyStories demonstrated that:",
        choices: [
          "Models under 100M parameters cannot produce grammatical English",
          "1–10M-parameter models produce coherent, grammatical stories when trained on a vocabulary-restricted synthetic distribution — capability tracks data scope, not just scale",
          "Synthetic data always beats web data at every scale",
          "Children's stories are the optimal pretraining corpus",
        ],
        answerIndex: 1,
        explanation:
          "Restrict the distribution (child-vocabulary synthetic stories) and coherence emerges at a thousandth the usual size. The intellectual ancestor of the modern synthetic-curriculum arc (Cosmopedia, SYNTH).",
      },
      {
        prompt:
          "Nemotron-CC's counterpoint to aggressive quality filtering (relevant at very large token budgets) is:",
        choices: [
          "Filtering is always wrong",
          "Heavy filtering starves long-horizon training of diversity — rephrasing/QA-ifying real web text recovers quality without shrinking the pool",
          "Only synthetic data should be used past 1T tokens",
          "Dedup should be skipped entirely at scale",
        ],
        answerIndex: 1,
        explanation:
          "At 15T-token horizons, aggressively filtered pools run dry; Nemotron-CC showed rephrased/ensembled real text beats discarding it. Filtering intensity is a function of your token budget.",
      },
    ],
};

export interface PublicQuiz {
  title: string;
  questions: Array<{ prompt: string; choices: string[] }>;
}

/**
 * Deterministic per-question choice shuffle. Authored banks cluster the
 * correct answer in predictable positions; serving a stable permutation
 * (pure function of quizId + question index, identical across deploys)
 * makes positions uninformative without any session state. gradeQuiz maps
 * submitted indexes back through the same permutation.
 */
function choicePermutation(key: string, len: number): number[] {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < key.length; i++) {
    h = (h ^ key.charCodeAt(i)) >>> 0;
    h = Math.imul(h, 16777619) >>> 0;
  }
  const idx = Array.from({ length: len }, (_, i) => i);
  for (let i = len - 1; i > 0; i--) {
    h ^= h << 13; h >>>= 0;
    h ^= h >>> 17;
    h ^= h << 5; h >>>= 0;
    const j = h % (i + 1);
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

function questionPermutation(quizId: string, qIndex: number, len: number): number[] {
  return choicePermutation(`${quizId}#${qIndex}`, len);
}

export function publicQuiz(quizId: string): PublicQuiz | null {
  const quiz = QUIZZES[quizId];
  if (!quiz) return null;
  return {
    title: quiz.title,
    questions: quiz.questions.map((q, i) => {
      const perm = questionPermutation(quizId, i, q.choices.length);
      return { prompt: q.prompt, choices: perm.map((p) => q.choices[p]) };
    }),
  };
}

/** The correct answer indexes in SERVED (shuffled) order — for the test rig. */
export function servedAnswerKey(quizId: string): number[] | null {
  const quiz = QUIZZES[quizId];
  if (!quiz) return null;
  return quiz.questions.map((q, i) =>
    questionPermutation(quizId, i, q.choices.length).indexOf(q.answerIndex),
  );
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
    const perm = questionPermutation(quizId, i, q.choices.length);
    // Answers arrive as indexes into the SERVED (shuffled) choice order.
    const given = answers[i] !== undefined ? perm[answers[i]] : undefined;
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
