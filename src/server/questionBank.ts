import { QUIZZES } from "./quizBank";
import { TASKS_BY_ID } from "@/data/curriculum";

/**
 * The unified question pool behind both "check your knowledge" (inline,
 * formative, no gate) and spaced-repetition review (a question enters your
 * deck once a task it's linked to is completed).
 *
 * Sources: every graded-drill question (linked to its drill task), plus the
 * CHECK_QUESTIONS below attached to key read/watch tasks. Server-only —
 * answers never ship to the client.
 */
export interface BankQuestion {
  id: string;
  prompt: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
  /** Task ids this question reviews; unlocked into the deck when any is done. */
  tasks: string[];
}

interface CheckQ {
  prompt: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
}

/** Inline check questions for key reading/watching tasks, keyed by task id. */
const CHECK_QUESTIONS: Record<string, CheckQ[]> = {
  "mm-brrr": [
    {
      prompt: "Per Horace He, the three regimes a deep-learning workload can be stuck in are:",
      choices: [
        "CPU-bound, GPU-bound, disk-bound",
        "Compute-bound, memory-bandwidth-bound, overhead-bound",
        "Latency-bound, throughput-bound, cost-bound",
        "Python-bound, C++-bound, CUDA-bound",
      ],
      answerIndex: 1,
      explanation:
        "Compute (the GPU's ALUs are the limit), memory bandwidth (moving tensors is the limit), overhead (Python/dispatch/launch time is the limit). Every fix targets exactly one regime.",
    },
    {
      prompt: "Your GPU shows low utilization and making the batch bigger doesn't change step time. Which regime are you likely in?",
      choices: ["Compute-bound", "Memory-bandwidth-bound", "Overhead-bound", "Numerically unstable"],
      answerIndex: 2,
      explanation:
        "If the GPU finishes before the host can feed it more work, batch size barely matters — the bottleneck is overhead (kernel launches, Python, dispatch). CUDA graphs and fusion attack this.",
    },
    {
      prompt: "Operator fusion (e.g. fusing activation into a matmul epilogue) primarily helps because:",
      choices: [
        "It reduces FLOPs",
        "It avoids writing an intermediate to HBM and reading it back",
        "It increases occupancy",
        "It reduces model size",
      ],
      answerIndex: 1,
      explanation:
        "Pointwise ops are bandwidth-bound; fusing keeps intermediates in registers/SRAM instead of round-tripping through global memory.",
    },
  ],
  "mm-glossary": [
    {
      prompt: "A warp is:",
      choices: [
        "A group of 32 threads executing in lockstep on an SM",
        "A unit of GPU memory",
        "A CUDA compiler pass",
        "One streaming multiprocessor",
      ],
      answerIndex: 0,
      explanation:
        "32 threads sharing one instruction stream — which is why divergent branches within a warp serialize.",
    },
    {
      prompt: "Occupancy measures:",
      choices: [
        "The fraction of peak FLOPS achieved",
        "How many warps are resident on an SM relative to its maximum",
        "GPU memory usage",
        "PCIe utilization",
      ],
      answerIndex: 1,
      explanation:
        "More resident warps give the scheduler more options to hide memory latency — though high occupancy is a means, not the goal.",
    },
  ],
  "pt-ezyang": [
    {
      prompt: "In PyTorch, `x.t()` (transpose) on a 2-D tensor:",
      choices: [
        "Copies the data in transposed order",
        "Returns a view sharing the same storage with swapped strides",
        "Allocates on a different device",
        "Is only valid for contiguous tensors",
      ],
      answerIndex: 1,
      explanation:
        "Views are stride tricks over the same Storage — no data moves. That's why a later .contiguous() (or reshape of a non-contiguous view) triggers the actual copy.",
    },
    {
      prompt: "A tensor with shape (2, 3) and strides (3, 1) is laid out:",
      choices: [
        "Column-major",
        "Row-major (contiguous)",
        "As a broadcast view",
        "On disk",
      ],
      answerIndex: 1,
      explanation:
        "Moving one step along dim 0 jumps 3 elements, along dim 1 jumps 1 — classic C-contiguous row-major. Stride 0 on a dim would be a broadcast view.",
    },
  ],
  "fp-tokenizer": [
    {
      prompt: "BPE builds its vocabulary by:",
      choices: [
        "Splitting on whitespace and keeping the top-k words",
        "Iteratively merging the most frequent adjacent symbol pair",
        "Hashing character n-grams",
        "Training a neural network to segment text",
      ],
      answerIndex: 1,
      explanation:
        "Start from bytes/characters, repeatedly merge the most frequent pair into a new token — the merge list IS the tokenizer.",
    },
    {
      prompt: "Why is streaming detokenization subtle in a serving engine?",
      choices: [
        "Tokens arrive out of order",
        "A token boundary can fall mid-way through a multi-byte UTF-8 character or word, so you can't always emit text for every token immediately",
        "The tokenizer runs on GPU",
        "It isn't — it's trivial",
      ],
      answerIndex: 1,
      explanation:
        "Engines buffer until a valid UTF-8 boundary; naive per-token decoding produces mojibake. This is a real class of serving bugs.",
    },
  ],
  "fp-sampling": [
    {
      prompt: "Top-p (nucleus) sampling keeps:",
      choices: [
        "The p most likely tokens",
        "The smallest set of tokens whose cumulative probability exceeds p",
        "Tokens with probability above p",
        "One token in p tries",
      ],
      answerIndex: 1,
      explanation:
        "The nucleus adapts its size to the distribution's shape — few tokens when confident, many when uncertain.",
    },
    {
      prompt: "Min-p sampling keeps tokens whose probability is:",
      choices: [
        "Above an absolute constant",
        "Above p × (probability of the most likely token)",
        "In the top p percent by rank",
        "Above the mean probability",
      ],
      answerIndex: 1,
      explanation:
        "The threshold scales with the top token's confidence — stricter when the model is sure, looser when it's not. That's why it beats top-p at high temperatures.",
    },
  ],
  "zoo-mqa": [
    {
      prompt: "GQA with 8 KV heads for 64 query heads means:",
      choices: [
        "Each KV head serves a group of 8 query heads",
        "Only 8 query heads are used",
        "The model has 8 layers",
        "KV cache grows 8×",
      ],
      answerIndex: 0,
      explanation:
        "Query heads share KV heads in groups — 64/8 = 8 query heads per KV head, and the KV cache shrinks by that same 8×.",
    },
  ],
  "zoo-rope": [
    {
      prompt: "RoPE encodes position by:",
      choices: [
        "Adding a learned embedding per position",
        "Rotating query/key vector pairs by position-dependent angles, making attention depend on relative offsets",
        "Concatenating the position index",
        "Masking distant tokens",
      ],
      answerIndex: 1,
      explanation:
        "The rotation trick makes q·k depend on (i − j), which is what enables the frequency-scaling family of context-extension hacks.",
    },
    {
      prompt: "YaRN-style context extension works by:",
      choices: [
        "Retraining from scratch at longer length",
        "Rescaling RoPE frequencies (interpolating positions) so longer sequences map into the trained range",
        "Truncating the prompt",
        "Adding more KV heads",
      ],
      answerIndex: 1,
      explanation:
        "Stretch/interpolate the rotary frequencies (with per-band treatment in YaRN) so 128k behaves like the trained 8k — usually with a light fine-tune.",
    },
  ],
  "batch-paged": [
    {
      prompt: "Before PagedAttention, the dominant KV-cache problem vLLM's paper measured was:",
      choices: [
        "Slow attention kernels",
        "60-80% of KV memory wasted to fragmentation and over-reservation",
        "Too many cache hits",
        "Disk I/O",
      ],
      answerIndex: 1,
      explanation:
        "Engines reserved max-length contiguous buffers per request. Paging into fixed-size blocks cut waste to under ~4%.",
    },
    {
      prompt: "Paged KV blocks enable copy-on-write sharing, which pays off when:",
      choices: [
        "Every request is unique",
        "Multiple sequences share a prefix (system prompts, beam candidates, n>1 sampling)",
        "The GPU is idle",
        "Sequences are short",
      ],
      answerIndex: 1,
      explanation:
        "Shared prefixes map to the same physical blocks; a block is copied only when a sequence diverges and writes.",
    },
  ],
  "cuda-pmpp-1": [
    {
      prompt: "Threads in the same warp take different branches of an if/else. What happens?",
      choices: [
        "They run both branches in parallel",
        "The warp serializes: each branch path executes with the other threads masked off",
        "A runtime error",
        "The scheduler moves them to different warps",
      ],
      answerIndex: 1,
      explanation: "Warp divergence — both paths execute serially with predication. Structure kernels so warps branch together.",
    },
    {
      prompt: "Memory coalescing means:",
      choices: [
        "Compressing tensors in HBM",
        "Adjacent threads in a warp accessing adjacent addresses, so loads combine into few wide transactions",
        "Caching in L2",
        "Using shared memory",
      ],
      answerIndex: 1,
      explanation:
        "A warp's 32 loads from consecutive addresses become a handful of 128-byte transactions; strided/scattered access multiplies memory traffic.",
    },
    {
      prompt: "Shared memory tiling speeds up matmul because:",
      choices: [
        "Shared memory has more capacity than HBM",
        "Each tile is loaded from HBM once and reused many times from fast on-chip SRAM",
        "It increases FLOPs",
        "It avoids synchronization",
      ],
      answerIndex: 1,
      explanation:
        "Reuse is the whole game: tiling raises arithmetic intensity by amortizing each global load across many multiply-adds.",
    },
  ],
  "matmul-boehm": [
    {
      prompt: "In Boehm's worklog, the first big jump over the naive kernel comes from:",
      choices: [
        "Tensor cores",
        "Global memory coalescing — reordering thread-to-element mapping",
        "Using double precision",
        "Loop unrolling",
      ],
      answerIndex: 1,
      explanation:
        "Fixing the access pattern so warps read contiguous memory gave ~8× before any tiling — bandwidth discipline first, then reuse.",
    },
  ],
  "fa-papers": [
    {
      prompt: "FlashAttention's core insight is that standard attention is bottlenecked by:",
      choices: [
        "FLOPs of the softmax",
        "Reading/writing the N×N score matrix to HBM — so tile it and never materialize it",
        "The number of heads",
        "Kernel launch overhead",
      ],
      answerIndex: 1,
      explanation:
        "It's an IO argument, not a FLOP one: computing attention tile-by-tile in SRAM with online softmax removes the O(N²) HBM traffic.",
    },
    {
      prompt: "Online softmax lets you process attention in tiles by:",
      choices: [
        "Skipping normalization",
        "Tracking a running max and running sum, rescaling previous partial results as new tiles arrive",
        "Using integer arithmetic",
        "Sorting the scores first",
      ],
      answerIndex: 1,
      explanation:
        "Each new tile can shift the max; the running rescale keeps the partial output exact without ever seeing all scores at once.",
    },
  ],
  "quant-visual": [
    {
      prompt: "Asymmetric quantization differs from symmetric by:",
      choices: [
        "Using more bits",
        "Adding a zero-point so the integer range maps to [min, max] instead of [−a, a]",
        "Only quantizing activations",
        "Being lossless",
      ],
      answerIndex: 1,
      explanation:
        "The zero-point offset wastes no levels when the distribution isn't centered — important for activations (e.g. post-ReLU) and grouped weights.",
    },
  ],
  "vllm-anatomy": [
    {
      prompt: "vLLM V1's scheduler treats prefill and decode as:",
      choices: [
        "Two separate queues with different engines",
        "One unified token budget per step — a request contributes however many tokens it needs",
        "Alternating phases",
        "GPU streams",
      ],
      answerIndex: 1,
      explanation:
        "V1 dropped the prefill/decode distinction in scheduling: each step packs tokens (chunked prefills + decodes) up to a budget.",
    },
    {
      prompt: "V1's automatic prefix caching identifies reusable KV blocks by:",
      choices: [
        "Request user id",
        "Hashing each block's token content (plus prefix chain)",
        "Timestamps",
        "Model version",
      ],
      answerIndex: 1,
      explanation:
        "Content-addressed blocks: same tokens → same hash → cache hit, with LRU eviction. It's near-zero overhead, so it's on by default.",
    },
  ],
  "econ-first-principles": [
    {
      prompt: "The dominant driver of $/token for self-hosted serving is:",
      choices: [
        "Electricity price",
        "GPU-hours amortized over the tokens you actually push through them — i.e., achieved throughput at your SLO",
        "Software licenses",
        "Network egress",
      ],
      answerIndex: 1,
      explanation:
        "The GPU costs the same per hour at any utilization; goodput at your latency target is the denominator that decides everything.",
    },
  ],
};

function quizTaskId(quizId: string): string | null {
  for (const [taskId, task] of TASKS_BY_ID) {
    if (task.verifier?.type === "quiz" && task.verifier.quizId === quizId) return taskId;
  }
  return null;
}

function buildBank(): Map<string, BankQuestion> {
  const bank = new Map<string, BankQuestion>();
  // Drill questions, linked to their drill task. Ids are index-based — do not
  // reorder existing quiz question arrays (append only) or review state breaks.
  for (const [quizId, quiz] of Object.entries(QUIZZES)) {
    const taskId = quizTaskId(quizId);
    if (!taskId) continue;
    quiz.questions.forEach((q, i) => {
      const id = `q:${quizId}:${i}`;
      bank.set(id, { id, ...q, tasks: [taskId] });
    });
  }
  for (const [taskId, questions] of Object.entries(CHECK_QUESTIONS)) {
    questions.forEach((q, i) => {
      const id = `c:${taskId}:${i}`;
      bank.set(id, { id, ...q, tasks: [taskId] });
    });
  }
  return bank;
}

export const QUESTION_BANK = buildBank();

/** Check-your-knowledge questions for a task, answers stripped. */
export function checkQuestionsFor(taskId: string) {
  const qs = CHECK_QUESTIONS[taskId];
  if (!qs) return null;
  return qs.map((q, i) => ({
    id: `c:${taskId}:${i}`,
    prompt: q.prompt,
    choices: q.choices,
  }));
}

/** Task ids that have inline check questions (for the client UI). */
export const TASKS_WITH_CHECKS = Object.keys(CHECK_QUESTIONS);

/** All bank questions unlocked by a set of completed tasks. */
export function unlockedQuestions(doneTaskIds: Set<string>): BankQuestion[] {
  return [...QUESTION_BANK.values()].filter((q) =>
    q.tasks.some((t) => doneTaskIds.has(t)),
  );
}
