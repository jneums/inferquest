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

  "mm-linalg": [
    {
      prompt: "You compose two linear transformations by forming the matrix product M = AB and applying it to a vector v as Mv. Which transformation acts on v first?",
      choices: [
        "A first, then B, matching left-to-right reading order",
        "B first, then A, because the product is read like function composition A(B(v))",
        "Neither is 'first' — associativity means the order of application is irrelevant",
        "They act simultaneously, since the product collapses both into one matrix",
      ],
      answerIndex: 1,
      explanation: "ABv means B hits v first, then A transforms the result — the same right-to-left convention as f(g(x)). Associativity lets you regroup (AB)C vs A(BC), but it never lets you swap the order of application: AB and BA are generally different transformations (rotate-then-shear is not shear-then-rotate).",
    },
    {
      prompt: "In a matrix product where A is (m x n) and B is (n x p), why must the inner dimensions both be n?",
      choices: [
        "It is a bookkeeping convention; with a transpose you can multiply any two matrices",
        "Both matrices must contain the same total number of entries to be combined",
        "B maps vectors into an n-dimensional space, and A must accept exactly n-dimensional inputs — the intermediate spaces of the composition have to line up",
        "Matrix products are only defined when the result is square enough to be invertible",
      ],
      answerIndex: 2,
      explanation: "AB is a composition: B's output space is A's input space, so the dimension B outputs (n) must equal the dimension A consumes (n). This is exactly why chaining neural-net layers requires each layer's output width to equal the next layer's input width — it is not a notational convention.",
    },
  ],
  "fp-karpathy": [
    {
      prompt: "In scaled dot-product attention, why are the query-key dot products divided by sqrt(d_k) before the softmax?",
      choices: [
        "To normalize the attention weights so each row sums to 1",
        "To keep the logits' variance near 1 so softmax doesn't saturate into near one-hot peaks, which would kill gradient flow early in training",
        "To prevent fp16 numerical overflow in the score matrix",
        "To compensate for splitting the computation across multiple heads",
      ],
      answerIndex: 1,
      explanation: "Dot products of d_k independent unit-variance components have variance ~d_k, so unscaled logits get sharp and softmax collapses toward one-hot, starving most positions of gradient. Row normalization is the softmax's own job — the scaling controls the *sharpness* of that softmax, not the sum.",
    },
    {
      prompt: "To implement causal (autoregressive) masking, future positions are set to -infinity in the score matrix before the softmax. Why not just zero out the attention weights for future tokens after the softmax?",
      choices: [
        "Because -infinity is cheaper to compute than a post-softmax multiply by a 0/1 mask",
        "Zeroing after softmax works but only for the first attention layer",
        "You could, but only if the values V were also masked to zero",
        "Future tokens would still have inflated the softmax denominator, so the remaining weights are corrupted by information from positions that should be invisible",
      ],
      answerIndex: 3,
      explanation: "Softmax normalizes across all logits, so if future scores participate in the denominator, past tokens' weights already leak future information (and the surviving weights no longer sum to 1). Setting masked logits to -inf makes their exponentials exactly 0 before normalization, so the distribution is computed only over allowed positions.",
    },
    {
      prompt: "Why does a decoder-only transformer need positional embeddings added to its token embeddings at all?",
      choices: [
        "Self-attention is a weighted aggregation over a set — it is permutation-invariant, so without injected position information the model cannot distinguish token order",
        "Positional embeddings are what prevent tokens from attending to future positions",
        "Token embeddings are too low-rank, and positions add the missing capacity",
        "They are needed so the residual stream has the same width at every layer",
      ],
      answerIndex: 0,
      explanation: "Attention computes affinities from query-key dot products and averages values — shuffle the tokens and you get shuffled but otherwise identical outputs, so order must be injected explicitly. Blocking future positions is the causal mask's job, not the positional embedding's.",
    },
  ],
  "zoo-mla": [
    {
      prompt: "What does Multi-head Latent Attention (MLA) store in the KV cache for each token, and why does that shrink the cache so much?",
      choices: [
        "Per-head keys and values quantized to 4 bits, shrinking cache by the quantization ratio",
        "Only the keys — values are recomputed from keys on demand",
        "A single low-rank latent vector (plus a small decoupled RoPE key) from which all heads' keys and values derive, so cache size scales with the latent dim instead of heads x head_dim",
        "A running average of past keys and values, one vector per layer",
      ],
      answerIndex: 2,
      explanation: "MLA down-projects the hidden state into a compressed latent c_KV shared by all heads; full K and V never need materializing because the up-projections can be absorbed into the query and output projections at inference. Cache cost drops from 2*n_heads*d_head per layer to roughly d_c + d_R (about 4.5 d_head in DeepSeek-V2) — it is a low-rank trick, not quantization.",
    },
    {
      prompt: "Why can't standard RoPE simply be applied to MLA's compressed keys?",
      choices: [
        "RoPE's rotation would inject a position-dependent matrix between the query projection and the key up-projection, breaking the matrix-absorption trick and forcing recomputation of prefix keys every step",
        "RoPE only works when queries and keys have equal head dimensions, which compression violates",
        "The latent vector is too low-dimensional for the rotation frequencies to be distinguishable",
        "RoPE requires normalized keys, and the low-rank projection destroys the norm",
      ],
      answerIndex: 0,
      explanation: "MLA's efficiency comes from absorbing W_UK into the query path so cached latents are used directly; RoPE inserts a rotation that depends on the current position between those matrices, and matrix multiplication doesn't commute, so absorption fails. DeepSeek-V2's fix is decoupled RoPE: a few extra dimensions carry position via a separate small key, cached alongside the latent.",
    },
    {
      prompt: "How does MLA's approach to KV-cache reduction fundamentally differ from GQA/MQA?",
      choices: [
        "MLA reduces cache only at long context lengths, while GQA helps at all lengths",
        "GQA/MQA shrink the cache by making heads share fewer K/V projections (trading away quality), while MLA jointly compresses K and V into a learned low-rank latent and can match or exceed full MHA quality",
        "MLA eliminates the value cache entirely, whereas GQA only shrinks keys",
        "They are the same mechanism; MLA is GQA with one KV group plus RoPE",
      ],
      answerIndex: 1,
      explanation: "MQA/GQA reduce the number of distinct KV heads, which historically costs model quality relative to MHA; MLA instead learns a compressed shared representation from which per-head K/V are reconstructed (implicitly, via absorbed projections), cutting DeepSeek-V2's cache by ~93% versus its dense predecessor without the MQA quality penalty.",
    },
  ],
  "zoo-moe": [
    {
      prompt: "In a Switch-style MoE with capacity factor ~1.0, more tokens get routed to a popular expert than its capacity allows. What happens to the overflow tokens at that layer?",
      choices: [
        "They queue up and are processed by the expert in a second pass",
        "The router automatically retrains its weights to rebalance the batch",
        "They skip the expert computation entirely, passing through the layer via the residual connection",
        "They are evenly redistributed among all remaining experts",
      ],
      answerIndex: 2,
      explanation: "Expert capacity = (tokens per batch / num experts) x capacity factor, and tokens beyond it are dropped from expert computation — the residual connection carries them through unchanged. That is why capacity factor is a real quality/efficiency knob (Switch found 1-1.25 works well) rather than mere buffer bookkeeping.",
    },
    {
      prompt: "Why do MoE models need an auxiliary load-balancing loss during training?",
      choices: [
        "To make each expert specialize in a distinct human-interpretable topic",
        "Routing is self-reinforcing — favored experts train faster and get picked even more — so without a balancing term the router collapses onto a few experts, wasting the rest",
        "To ensure the softmax gate outputs valid probabilities",
        "To reduce cross-device communication volume during the forward pass",
      ],
      answerIndex: 1,
      explanation: "Early-favored experts improve fastest and attract still more traffic, a rich-get-richer loop that leaves most experts undertrained and effectively shrinks the model. The auxiliary loss rewards uniform expert utilization to break that loop; topic-level specialization is neither the goal nor what typically emerges.",
    },
    {
      prompt: "You're provisioning GPUs to serve Mixtral 8x7B (47B total parameters, ~13B active per token). What does the MoE's sparsity actually buy you at serving time?",
      choices: [
        "Roughly the per-token compute and latency of a ~13B dense model, but you still need VRAM for all 47B parameters since any token may route to any expert",
        "VRAM for only ~13B parameters, since inactive experts can stay on disk",
        "Nothing until batch sizes are large enough to fill every expert",
        "Lower memory AND lower compute, which is why MoEs strictly dominate dense models for serving",
      ],
      answerIndex: 0,
      explanation: "Sparsity cuts FLOPs (only top-k experts run per token) but not the parameter footprint — every expert must be resident because routing decisions arrive token by token. This compute-cheap/memory-hungry profile is the central MoE serving tradeoff, and it worsens at high batch sizes where collectively most experts are activated anyway.",
    },
  ],
  "kv-arithmetic": [
    {
      prompt: "For a dense P-parameter transformer, roughly how many FLOPs does the forward pass spend per token, and why?",
      choices: [
        "~P, since each weight is read exactly once",
        "~2P, since each parameter participates in one multiply and one add (a multiply-accumulate is 2 FLOPs)",
        "~6P, since each weight needs a multiply, an add, and an activation",
        "~2P per layer, so total FLOPs scale as 2P times the layer count",
      ],
      answerIndex: 1,
      explanation: "Every token flows through essentially all the weights via matmuls, and each weight contributes one MAC = 2 FLOPs, giving the 2P rule (P already counts all layers' weights, so don't multiply by depth again). The ~6P figure is the training rule, which adds the backward pass.",
    },
    {
      prompt: "You serve a 13B fp16 model at batch size 1 and observe decode running at a tiny fraction of the GPU's peak FLOPs. What sets the per-token decode latency floor?",
      choices: [
        "The sequential softmax in attention, which cannot be parallelized",
        "Kernel launch overhead from running thousands of small kernels",
        "PCIe transfer of logits back to the CPU each step",
        "Streaming all ~26 GB of weights through HBM every single token — decode at small batch is memory-bandwidth-bound, not compute-bound",
      ],
      answerIndex: 3,
      explanation: "Each decode step must read every parameter from HBM to produce one token, so the floor is (model bytes / memory bandwidth), and the arithmetic units sit mostly idle. Compute only becomes the binding constraint once enough tokens share each weight read.",
    },
    {
      prompt: "Why does raising the decode batch size from 1 to 64 multiply throughput almost 64x while barely changing per-token latency?",
      choices: [
        "Each request runs independently on its own set of SMs",
        "Larger batches let requests share one KV cache, eliminating redundant attention",
        "The weights are read from HBM once per step regardless of batch size, so extra tokens ride along nearly free until arithmetic intensity reaches the hardware's flops-to-bytes ratio (~200 tokens on an A100)",
        "CUDA graph capture removes the framework overhead that dominated at batch 1",
      ],
      answerIndex: 2,
      explanation: "In the memory-bound regime the step time is dominated by loading weights, a cost independent of batch size, so batching amortizes it across many tokens. Once batch size approaches the accelerator's flops:byte ratio the workload turns compute-bound and further batching raises latency proportionally; KV caches are per-request and are never shared across unrelated requests.",
    },
  ],
  "batch-orca": [
    {
      prompt: "In a batch of requests with different sequence lengths, why can the Linear/LayerNorm/GeLU ops be batched across all requests while the attention op cannot?",
      choices: [
        "Attention contains a softmax, and nonlinear ops can never be batched across requests",
        "Non-attention ops act identically and independently on each token, so all requests' tokens can be flattened into one [total_tokens, hidden] tensor; attention must mix tokens within the same request, and differing K/V lengths make those shapes irregular",
        "Linear layers share weights across requests while attention uses per-request weights",
        "Attention is too FLOPs-heavy to run in a single fused kernel across requests",
      ],
      answerIndex: 1,
      explanation: "Linear, LayerNorm, Add, and GeLU have no notion of which request a token belongs to, so lengths don't matter after flattening — note GeLU and LayerNorm are nonlinear too, so nonlinearity isn't the obstacle. Attention needs request boundaries (each token attends only within its own sequence, against a per-request K/V history), which is exactly what makes its inputs irregularly shaped.",
    },
    {
      prompt: "How does Orca's selective batching execute one iteration over a heterogeneous batch mixing prefills and decodes of different lengths?",
      choices: [
        "It pads every request to the longest sequence so all ops see a uniform [B, L, H] tensor",
        "It groups requests into equal-length sub-batches and runs each sub-batch separately end to end",
        "It flattens all tokens into a single [total_tokens, H] tensor for the non-attention ops, then Splits at the attention op to run each request's attention individually against its own cached K/V, and Merges the outputs back",
        "It defers new prefills until the running batch finishes, so shapes stay homogeneous",
      ],
      answerIndex: 2,
      explanation: "Batching is applied selectively: token-wise for shape-agnostic ops, per-request only at attention (with an Attention K/V manager holding each request's keys/values), sandwiched by Split and Merge. Padding to max length wastes compute and equal-length grouping collapses batching odds — avoiding both is the point of the technique.",
    },
  ],
  "batch-sarathi": [
    {
      prompt: "A vLLM-style scheduler that eagerly prioritizes prefills delivers great throughput but users report periodic multi-hundred-ms spikes in inter-token latency. What is the root cause Sarathi-Serve targets?",
      choices: [
        "When a new request arrives, its full prompt prefill occupies entire iterations, stalling every ongoing decode until the prefill completes (a generation stall)",
        "KV cache fragmentation forces periodic compaction pauses",
        "Prefill and decode run on separate CUDA streams that must synchronize",
        "The sampler batches token sampling across requests, delaying short requests",
      ],
      answerIndex: 0,
      explanation: "Prefill of a long prompt is compute-heavy and monopolizes the iteration, so all in-flight decodes stall — that is the throughput-vs-tail-latency tradeoff of prefill-prioritizing schedulers. Sarathi-Serve's stall-free scheduling splits prefills into chunks and coalesces each chunk with the ongoing decodes so decodes never pause.",
    },
    {
      prompt: "In chunked prefill, what is the downside of choosing a very small chunk size, even though it minimizes decode interference?",
      choices: [
        "The model's output quality degrades because attention within the prompt is truncated",
        "Prefill efficiency drops — tiny chunks underutilize the GPU, and each chunk's attention must re-read the ever-growing KV cache of earlier chunks",
        "Decodes starve because chunks always preempt them",
        "KV cache memory grows quadratically with the number of chunks",
      ],
      answerIndex: 1,
      explanation: "Chunking is mathematically exact (each chunk attends over all previously prefilled KV), so quality is untouched; the cost is efficiency: low arithmetic intensity per chunk plus repeated KV reads across chunks. Chunk size therefore trades prefill throughput against inter-token latency, which is why Sarathi picks it based on the latency SLO.",
    },
  ],
  "spec-leviathan": [
    {
      prompt: "In speculative decoding, when a draft token is rejected, the target resamples from norm(max(0, p - q)) rather than simply from p. What does this construction guarantee?",
      choices: [
        "The output matches the target model's distribution up to a small, bounded KL divergence",
        "Rejected tokens are always replaced by the target's argmax token",
        "The combined accept-or-resample process yields outputs whose distribution is exactly the target model's — provably identical, not approximate",
        "The draft model's distribution gradually converges to the target's over the generation",
      ],
      answerIndex: 2,
      explanation: "Acceptance with min(1, p/q) over-represents tokens where q exceeds p; sampling the residual distribution on rejection restores exactly the missing probability mass, so the scheme is lossless — a common misconception is that speculation trades a little accuracy for speed, but the distribution equality is exact. This also means no retraining: any draft works as a proposal because correctness never depends on it.",
    },
    {
      prompt: "You want more speedup from speculative decoding. Which change most directly helps?",
      choices: [
        "Pick the draft with the best standalone benchmark scores, regardless of the target model",
        "Pick a draft whose output distribution better matches the target's on your traffic (raising acceptance rate alpha) while staying several times cheaper per token",
        "Fine-tune the target model so it agrees with the draft more often",
        "Increase the number of speculated tokens per step as high as memory allows",
      ],
      answerIndex: 1,
      explanation: "Speedup is governed by alpha (how often the target accepts the draft's proposals, i.e., how close q is to p) against the cost ratio c — standalone accuracy is only a loose proxy for agreement with this particular target. Cranking up the speculation length gives diminishing returns since a whole block survives only with probability ~alpha^k while its draft cost grows linearly, and modifying the target defeats the purpose of lossless acceleration.",
    },
  ],
  "spec-eagle": [
    {
      prompt: "EAGLE-2 replaced EAGLE's static draft tree with a context-aware dynamic tree. What insight motivates this?",
      choices: [
        "Static trees exceed KV cache limits at long contexts, while dynamic trees fit",
        "Tree-structured drafts cannot be verified in one target forward pass unless built dynamically",
        "Dynamic trees let the draft model skip its own forward passes on easy tokens",
        "Token acceptance rates vary strongly with context, and the draft model's own confidence is a good proxy for acceptance — so the tree budget should be spent expanding likely branches instead of a fixed shape",
      ],
      answerIndex: 3,
      explanation: "In easy contexts drafts are accepted deep down one branch; in hard contexts breadth matters more — a fixed tree wastes verification budget in both cases, so EAGLE-2 grows the tree where draft confidence (approximating acceptance probability) is high. Both static and dynamic trees are verified in a single target pass via tree attention; that is not what changed.",
    },
    {
      prompt: "EAGLE trained its draft head to regress the target model's top-layer hidden features. Why did EAGLE-3 abandon that feature-prediction objective?",
      choices: [
        "The feature-regression constraint capped what the draft could learn — adding training data stopped helping — so EAGLE-3 predicts tokens directly, using low-, mid-, and high-layer features fused via a training-time-test technique, which restores data-scaling gains",
        "Predicting features required retraining the target model jointly with the draft",
        "Top-layer features are unavailable at inference time, making EAGLE incorrect",
        "Feature regression only works for greedy decoding, not sampling",
      ],
      answerIndex: 0,
      explanation: "Forcing the draft to reproduce the target's exact top-layer features (which are optimized for next-token, not multi-step, prediction) became the bottleneck: EAGLE-1/2 showed limited improvement from more training data. Dropping that loss for direct token prediction over fused multi-layer features lets draft quality scale with data — unlike Medusa's independent per-offset heads, the draft remains autoregressive, which is why acceptance rates stay high.",
    },
  ],
  "lc-sinks": [
    {
      prompt: "Plain sliding-window attention works fine until the very first tokens of the sequence slide out of the cache, at which point perplexity explodes. Why do those particular tokens matter so much?",
      choices: [
        "The first tokens usually contain the instructions that condition the whole generation",
        "Their positional embeddings anchor the coordinate frame for all later positions",
        "Models learn to dump excess attention mass on the earliest tokens — they are visible to every later position and softmax must sum to 1 — so these 'attention sinks' become load-bearing, and evicting them deranges the attention distribution at every layer",
        "The first tokens hold the KV entries with the largest magnitudes, so removing them changes normalization statistics",
      ],
      answerIndex: 2,
      explanation: "Because softmax forces a probability distribution, heads offload unneeded mass somewhere, and the always-visible initial tokens become that somewhere during training — the effect persists even when the first token is semantically empty (e.g., a newline). It is their position, not their content, that matters, which is why merely keeping ~4 initial tokens' KV restores stability.",
    },
    {
      prompt: "StreamingLLM keeps the KV of ~4 initial sink tokens plus a sliding window of recent tokens, letting models stream over millions of tokens. What can this recipe NOT do?",
      choices: [
        "Recall or use information from the middle tokens that were evicted — it stabilizes endless streaming but does not extend the effective context or long-range memory",
        "Run past the model's pretraining sequence length without fine-tuning",
        "Keep memory usage constant as the stream grows",
        "Work on models that were never trained with a special sink token",
      ],
      answerIndex: 0,
      explanation: "Evicted KV is gone: a fact mentioned 100k tokens ago is unrecoverable, so StreamingLLM is a stability/efficiency technique, not a long-context capability — a frequent misreading of the '4 million tokens' claim. The things it CAN do are precisely the other three: constant memory, indefinite streaming beyond the training length, and operation on off-the-shelf models (a learnable sink token just helps further).",
    },
    {
      prompt: "H2O keeps the KV cache within a fixed budget by retaining 'heavy hitters' alongside recent tokens. How does it pick which entries to keep, and what correctness property is given up?",
      choices: [
        "It keeps tokens with the largest key-vector norms; the result is exact because those dominate the output",
        "It keeps tokens with high accumulated attention scores; the result is approximate — greedy eviction discards state permanently, so outputs can diverge from full-cache generation",
        "It keeps the rarest tokens by corpus frequency; exactness is preserved by re-fetching evicted entries on demand",
        "It keeps a uniform random sample; the randomness provides an unbiased estimate of full attention",
      ],
      answerIndex: 1,
      explanation: "H2O exploits the observation that a small set of tokens accrues most attention mass, scoring entries by cumulative attention and greedily evicting the rest — but unlike paging or offloading, eviction here is destruction: nothing can be re-fetched, so like StreamingLLM this is lossy compression of the model's state, not an exact optimization.",
    },
  ],
  "lc-hybrid": [
    {
      prompt: "Why does a model that interleaves sliding-window and full-attention layers (e.g., Gemma-style) need a hybrid KV cache manager rather than one uniform per-request block allocation?",
      choices: [
        "Sliding-window layers produce smaller K/V vectors that don't fit standard block sizes",
        "The two layer types have different KV lifetimes — sliding-window layers can free blocks once tokens fall outside the window, while full-attention layers must keep everything — so managing all layers under the full-attention policy forfeits all that reclaimable memory",
        "Sliding-window layers cannot use paged attention kernels at all",
        "Full-attention layers must be placed on different GPUs than sliding-window layers",
      ],
      answerIndex: 1,
      explanation: "The whole point is memory: a window layer only ever needs the last window-size tokens' KV, so its old blocks are dead weight the manager should free or never allocate. vLLM handles this by grouping layers of the same type into KV cache groups with a common page size and applying type-specific allocation logic per group.",
    },
    {
      prompt: "In a hybrid model with both full-attention and sliding-window layers, when can a stored prefix be counted as a prefix-cache hit for a new request?",
      choices: [
        "Whenever any layer group still holds any blocks of the prefix",
        "Never — sliding-window layers make prefix caching impossible in hybrid models",
        "Only when every token of the prefix is cached in every layer, since attention layers are stacked",
        "When each group's own requirement is met — full-attention groups need the entire prefix cached, while sliding-window groups only need roughly the last window-size tokens — and the manager takes the intersection of these constraints",
      ],
      answerIndex: 3,
      explanation: "A sliding-window layer will never look beyond its window, so demanding the whole prefix for those layers is unnecessarily strict, while full-attention layers genuinely need all of it. The coordinator therefore checks each cache group's condition separately (window groups even scan right-to-left) and accepts the longest prefix satisfying all groups.",
    },
  ],
  "lc-family": [
    {
      prompt: "A team already runs H2O-style token eviction under a fixed per-layer cache budget. Which technique attacks an orthogonal axis — composable with their setup rather than competing with it?",
      choices: [
        "SnapKV, which selects important tokens using attention from an observation window",
        "KIVI-style KV quantization, which shrinks the bytes per retained entry regardless of which entries are retained",
        "StreamingLLM, which keeps sink tokens plus a recency window",
        "TOVA-style eviction driven by the latest token's attention",
      ],
      answerIndex: 1,
      explanation: "KV-cache methods factor into orthogonal axes — which entries to keep (eviction/selection), how many per layer or head (budget allocation), how many bits each costs (quantization), and whether to fuse rather than drop (merging) — and choices on different axes multiply their savings. SnapKV, StreamingLLM, and TOVA are all alternative answers to the same 'which tokens' question H2O already answers.",
    },
    {
      prompt: "What distinguishes budget-allocation methods like PyramidKV from eviction policies like H2O?",
      choices: [
        "Budget allocation is training-time only, while eviction happens at inference",
        "Budget allocation decides HOW MUCH cache each layer (or head) gets — e.g., more for lower layers where attention is diffuse — while an eviction policy decides WHICH entries fill that budget; the two compose rather than compete",
        "Budget allocation is lossless while eviction is lossy",
        "PyramidKV quantizes each layer at a different bit-width, whereas H2O keeps full precision",
      ],
      answerIndex: 1,
      explanation: "PyramidKV's observation is that attention grows more concentrated in higher layers, so a uniform per-layer budget is wasteful — but once budgets are set, you still need a selection rule (H2O scores, SnapKV windows, recency) to choose the survivors. Both are lossy since discarded state is unrecoverable, and neither is about numeric precision.",
    },
  ],
  "engine-nano": [
    {
      prompt: "In a minimal vLLM-style engine (as in nano-vllm's ~1.2k lines), two requests share a long identical prompt prefix but the second recomputes it instead of reusing cached KV. Which component owns the logic you'd debug?",
      choices: [
        "The scheduler, which decides which sequences run each iteration",
        "The model runner, which builds input tensors and executes the forward pass",
        "The sampler, which maps logits to tokens",
        "The block manager, which allocates fixed-size KV blocks and matches hashed prefix blocks for reuse",
      ],
      answerIndex: 3,
      explanation: "The clean separation is: scheduler = policy over which sequences advance, block manager = KV memory accounting including hash-based prefix block reuse, model runner = pure execution of the chosen batch. Prefix caching is a memory-identity question — do these tokens map to an existing block? — so it lives in the block manager, not in scheduling or execution.",
    },
    {
      prompt: "Mid-generation, the block manager reports no free KV blocks while running sequences still need to append tokens. What should a continuous-batching engine do?",
      choices: [
        "Preempt one or more sequences — free their blocks and return them to the waiting queue to be resumed (recomputed or reloaded) once memory frees up",
        "Kill the newest request with an out-of-memory error, since its arrival caused the pressure",
        "Block the whole engine until some sequence finishes and releases its blocks",
        "Silently truncate the longest sequence's oldest KV blocks to make room",
      ],
      answerIndex: 0,
      explanation: "Because scheduling is per-iteration, the engine can gracefully shed load: preempted sequences release their blocks now and rejoin the queue later, preserving correctness at the cost of recomputation. Waiting risks deadlock (nobody can finish if nobody can append), and truncating cached KV would silently corrupt outputs — this preemption path is exactly why even a minimal engine keeps scheduler and block manager as distinct cooperating components.",
    },
  ],
  "cuda-gpumode-early": [
    {
      prompt: "You wrap a custom CUDA kernel call with Python's time.time() before and after, and it reports 0.02 ms — suspiciously fast. What is the most likely explanation?",
      choices: [
        "CUDA kernel launches are asynchronous, so you timed only the CPU-side launch; you need to synchronize (or use CUDA events / the profiler) to measure actual GPU execution time",
        "The GPU cached the kernel's output from a previous run and skipped execution entirely",
        "time.time() has insufficient resolution for GPU work, so it rounds all measurements down",
        "The kernel ran in low-precision mode by default, making it genuinely that fast",
      ],
      answerIndex: 0,
      explanation: "Kernel launches return control to the CPU immediately while the GPU works in the background, so naive wall-clock timing measures dispatch, not execution. Proper measurement requires torch.cuda.synchronize() or CUDA events, plus warmup iterations to exclude one-time compilation and allocation costs.",
    },
    {
      prompt: "What is the main reason GPU MODE's early lectures teach torch.utils.cpp_extension.load_inline for writing custom CUDA kernels?",
      choices: [
        "It interprets CUDA source at runtime, so kernels run without ever being compiled",
        "It lets you compile a CUDA/C++ snippet and call it as a PyTorch op directly from a Python script, enabling fast iteration and comparison against PyTorch reference implementations without a separate build system",
        "It automatically translates Python functions into equivalent CUDA kernels",
        "It is required for torch.compile to recognize custom operators",
      ],
      answerIndex: 1,
      explanation: "load_inline compiles the source string into an extension and binds it into the running Python process, so you can prototype a kernel, check it against torch's own implementation, and profile it in one script. The code is still genuinely compiled by nvcc — the convenience is in the workflow, not in skipping compilation.",
    },
  ],
  "cuda-stephen-jones": [
    {
      prompt: "DRAM access takes hundreds of cycles on both CPUs and GPUs. How does each architecture primarily deal with this latency?",
      choices: [
        "CPUs hide latency with more threads; GPUs minimize it with large caches",
        "Both minimize latency with deep cache hierarchies; the GPU's is simply larger",
        "CPUs minimize latency (big caches, branch prediction, out-of-order execution); GPUs tolerate it by oversubscribing with far more threads than can run at once, switching to ready warps while others wait on memory",
        "GPUs avoid the problem entirely because their memory has effectively no latency, only limited bandwidth",
      ],
      answerIndex: 2,
      explanation: "The CPU spends its silicon making one thread's memory accesses fast; the GPU spends it holding thousands of thread contexts so that stalls in some warps are covered by running others. This is the core throughput-machine idea: latency is hidden, not eliminated.",
    },
    {
      prompt: "A kernel launches exactly as many threads as the GPU has physical execution lanes ('one thread per core'), yet achieves poor memory bandwidth. Why does the GPU want many times more threads than it can execute simultaneously?",
      choices: [
        "Extra threads act as spares that replace threads corrupted by memory errors",
        "Saturating DRAM bandwidth requires many memory requests in flight concurrently; only heavy oversubscription generates enough outstanding loads to fill the memory pipeline while stalled warps wait",
        "The scheduler requires a power-of-two thread count to avoid partial warps",
        "More threads increase the clock frequency of the memory controller",
      ],
      answerIndex: 1,
      explanation: "Bandwidth equals requests-in-flight divided by latency (Little's law), so with hundreds of cycles of latency you need thousands of outstanding accesses to keep DRAM busy. One thread per lane leaves nothing to switch to during stalls, so both the ALUs and the memory system idle.",
    },
    {
      prompt: "Why can a GPU switch between stalled and ready warps every cycle at essentially zero cost, when a CPU thread context switch costs microseconds?",
      choices: [
        "GPU threads carry no state at all, so there is nothing to save on a switch",
        "The GPU driver pre-computes an optimal schedule at kernel launch, eliminating runtime switching",
        "GPU warps run in lockstep, so a stalled warp automatically stalls the whole SM until memory returns",
        "Every resident warp keeps its registers permanently allocated in the SM's large register file, so switching is just the scheduler picking a different ready warp — no state is saved or restored",
      ],
      answerIndex: 3,
      explanation: "A CPU context switch must spill and reload architectural state through memory; a GPU instead sizes its register file so all resident threads' state lives on-chip simultaneously. This is why register usage per thread limits how many warps can be resident — the latency-hiding pool is bought with register file capacity.",
    },
  ],
  "matmul-pmpp-2": [
    {
      prompt: "To sum 1M elements, every thread does atomicAdd(&result, x[i]) on a single global accumulator. The kernel is orders of magnitude slower than expected. Why?",
      choices: [
        "atomicAdd on floating-point values must round-trip through the CPU for correctness",
        "Atomic operations on the same address must execute one at a time, so despite launching a million threads the accumulation is effectively serialized by contention",
        "Atomics bypass the L2 cache, so every operation pays full DRAM latency twice",
        "The atomic unit only supports integer types, forcing a software emulation path",
      ],
      answerIndex: 1,
      explanation: "Atomics to one location are serialized by the hardware, so throughput collapses to roughly one update per memory-system round trip regardless of thread count. A tree reduction fixes this by having threads combine disjoint pairs of partial sums in parallel — O(n) work in O(log n) steps with contention eliminated by construction.",
    },
    {
      prompt: "Why does privatization — each thread block accumulating into its own histogram copy in shared memory before merging into the global histogram — dramatically speed up parallel histogramming?",
      choices: [
        "Contention on each bin is divided across many private copies, and the atomics that remain hit low-latency shared memory; the final merge adds only one global atomic per bin per block",
        "It eliminates the need for atomic operations entirely, since each thread owns its own bins",
        "Shared memory automatically deduplicates identical updates before they are applied",
        "It converts the histogram into a sort, which GPUs execute natively in hardware",
      ],
      answerIndex: 0,
      explanation: "Privatization attacks both costs of atomic contention: fewer threads compete for each copy of a bin, and shared-memory atomics are far cheaper than global ones. Atomics are still needed within a block (many threads share the private copy), but the expensive global traffic shrinks to one merge per bin per block.",
    },
    {
      prompt: "A work-efficient scan (Brent-Kung) performs O(n) operations but needs about twice as many phases as the O(n log n)-work Kogge-Stone scan. When does the work-efficient version actually win?",
      choices: [
        "Never in practice — step count always determines GPU runtime because steps are the unit of scheduling",
        "Only when the input contains mostly zeros, since skipped additions dominate the savings",
        "When the input is large enough that the GPU is saturated with work, so total operations (not step count) determine runtime; for small inputs with idle execution resources, the fewer-step algorithm wins instead",
        "Always — doing asymptotically less work is faster regardless of input size",
      ],
      answerIndex: 2,
      explanation: "Extra parallel steps are free only while the machine has idle lanes to absorb the extra work; once every SM is busy, an algorithm doing log(n) times more additions takes proportionally longer. This is the general lesson of work-efficiency: on a saturated parallel machine, total work converts directly into time.",
    },
  ],
  "prof-checklist": [
    {
      prompt: "A teammate insists on refactoring a kernel from 60% to 95% occupancy. Under what reasoning could this effort be wasted or even counterproductive?",
      choices: [
        "Occupancy above 75% is impossible on current hardware, so the target is unreachable",
        "Occupancy is a means of hiding latency, not a goal: if 60% occupancy already provides enough in-flight work to saturate the bottleneck (e.g., DRAM bandwidth), more warps add nothing — and squeezing register usage to raise occupancy can cause spills that make the kernel slower",
        "Higher occupancy always helps, so the effort cannot be wasted — only insufficient",
        "Occupancy only matters for compute-bound kernels, and most kernels are memory-bound",
      ],
      answerIndex: 1,
      explanation: "Latency can be hidden by more warps (occupancy) or by more independent work per thread (ILP); once the limiting resource is saturated, extra occupancy is pure overhead. Chasing the occupancy metric by cutting registers per thread trades cheap register accesses for spills to local memory — a classic way to make a kernel slower while a dashboard number improves.",
    },
    {
      prompt: "Your memory-bound kernel achieves 88% of the GPU's peak DRAM bandwidth. What is the right next move?",
      choices: [
        "Increase the thread block size until bandwidth utilization reaches 100%",
        "Convert the kernel to use tensor cores, which have higher throughput than the memory system",
        "Add software prefetching, which raises the bandwidth ceiling itself",
        "Recognize the kernel is near its speed-of-light: further tuning of this kernel has at most ~12% upside, so either stop, or change the algorithm to move fewer bytes (fusion, better data reuse, lower precision)",
      ],
      answerIndex: 3,
      explanation: "Comparing achieved throughput against the hardware ceiling for the resource that bounds you tells you exactly how much headroom remains — the profiler-driven answer to 'when do I stop?'. Past ~90% of speed-of-light the only meaningful wins come from reducing the work itself, not from executing the same memory traffic more cleverly.",
    },
  ],
  "prof-graphs": [
    {
      prompt: "Why does small-batch LLM decode benefit more from CUDA graphs than large-batch prefill?",
      choices: [
        "Graphs increase arithmetic throughput, which decode needs more than prefill",
        "Each decode step launches hundreds of kernels that each run for only microseconds, so per-kernel CPU launch overhead leaves the GPU idle between kernels; replaying one pre-recorded graph submits all of them in a single launch. Prefill kernels run long enough that launch gaps are negligible",
        "CUDA graphs compress the KV cache, which only helps at small batch sizes",
        "Prefill cannot use graphs because attention is mathematically incompatible with graph capture",
      ],
      answerIndex: 1,
      explanation: "Launch overhead is a fixed CPU-side cost (Python, framework dispatch, driver) per kernel, while GPU work scales with batch size — so tiny decode kernels can spend more time waiting on launches than computing. A graph replay skips all per-kernel dispatch layers via a single cudaGraphLaunch, packing the kernels back-to-back.",
    },
    {
      prompt: "A captured CUDA graph must run on a new batch of input data each step. How is this done, given replay constraints?",
      choices: [
        "Pass the new tensors as arguments to replay(); the graph rebinds pointers automatically",
        "Re-capture the graph each step with the new tensors, amortizing capture cost over the step",
        "Copy the new data into the same static input tensors that were used at capture time, then replay; every replay reuses identical kernels, arguments, and memory addresses, so I/O must live at fixed locations",
        "Mark the input tensors as volatile so the driver re-reads their metadata at launch",
      ],
      answerIndex: 2,
      explanation: "A graph bakes in pointers along with kernels, which is exactly why replay is so cheap — nothing is re-derived at launch. The price is a static-world contract: fixed shapes, fixed addresses, static control flow, and no CPU synchronization inside the captured region; new data flows in only by overwriting the placeholder buffers.",
    },
  ],
  "compile-basics": [
    {
      prompt: "Why does torch.compile deliver large decode speedups only when the KV cache is made static (pre-allocated to maximum length)?",
      choices: [
        "A static cache stores keys and values in lower precision, reducing memory traffic",
        "A dynamic KV cache grows every generation step, so tensor shapes change step to step and the compiled graph's guards fail; pre-allocating fixed-shape buffers lets one compiled graph be reused for every decode step",
        "torch.compile refuses to trace any module that allocates GPU memory",
        "The static cache removes attention from the graph, which is the slowest op to compile",
      ],
      answerIndex: 1,
      explanation: "Compiled artifacts are specialized to tensor shapes; a cache that grows each step presents a new shape each step, forcing recompilation or eager fallback. With a fixed-size cache (plus position indices into it), every decode step is shape-identical, so the expensive compilation is paid once and amortized over thousands of steps.",
    },
    {
      prompt: "A compiled generation service runs fast most of the time but intermittently stalls for tens of seconds on some requests. What is the most likely cause?",
      choices: [
        "Requests arriving with new batch sizes or prompt lengths trigger recompilation for the unseen shapes; bucketing — e.g., padding inputs to a small set of length multiples and fixing batch size — bounds the number of compiled variants",
        "The GPU periodically flushes its instruction cache, forcing kernels to reload",
        "torch.compile re-optimizes the graph in the background every N requests by design",
        "The KV cache periodically defragments itself, blocking generation",
      ],
      answerIndex: 0,
      explanation: "Each novel input shape (batch size, padded sequence length, larger max output length) can miss the compile cache and pay full compilation latency inline with the request. Padding to a limited set of shape buckets trades a little wasted compute for a bounded, warmed-up set of compiled graphs.",
    },
    {
      prompt: "What happens at a 'graph break' in torch.compile, and why does compiling with fullgraph=True refuse to run when one occurs?",
      choices: [
        "A graph break is a CUDA error that aborts the kernel; fullgraph=True adds error recovery",
        "A graph break splits the model across two GPUs; fullgraph=True requires single-GPU execution",
        "At untraceable code (data-dependent Python control flow, unsupported calls), Dynamo splits execution into separate compiled subgraphs with eager Python running in between — losing fusion and adding overhead at each seam; fullgraph=True turns this silent degradation into a hard error so you can fix the break",
        "A graph break frees the compilation cache to save memory; fullgraph=True pins it instead",
      ],
      answerIndex: 2,
      explanation: "Breaks don't crash by default — they quietly fragment the model into smaller graphs stitched together by the Python interpreter, which caps the optimizer's ability to fuse across the boundary. fullgraph=True is a guardrail for latency-critical paths like decode: it forces you to eliminate breaks rather than silently pay for them.",
    },
  ],
  "compile-vllm": [
    {
      prompt: "vLLM compiles the model piecewise, wrapping attention as an opaque custom op that stays in eager mode while everything between attentions is compiled and captured into CUDA graphs. Why treat attention specially?",
      choices: [
        "Attention contains no matrix multiplications, so compilation offers it no benefit",
        "Attention kernels are written in Triton, which torch.compile cannot invoke",
        "Compiling attention would leak KV-cache contents into the compile cache on disk",
        "Attention interacts with the paged KV cache and continuous batching — data-dependent gathers, variable sequence lengths, evolving metadata — making it hard to make compile/cudagraph-safe, while the surrounding computation is token-wise with static shapes per batch size and captures cleanly",
      ],
      answerIndex: 3,
      explanation: "Hiding attention behind a custom op keeps Dynamo from tracing into its dynamic internals, so the rest of the model still forms clean static subgraphs that benefit from fusion and graph replay. This split gets most of the win — the token-wise MLP/norm/projection kernels — without forcing the serving-specific attention machinery into a static-world contract.",
    },
    {
      prompt: "How does vLLM's compilation cache design avoid latency spikes in production serving?",
      choices: [
        "All compilation is finished before the server accepts requests, and artifacts are cached in a directory keyed by hashes of the model config and relevant code — so restarts reuse prior work, and any code or config change deliberately misses the cache and recompiles",
        "Compilation runs on a background thread, and requests use eager mode until each kernel finishes compiling",
        "The cache stores kernels on the GPU itself, surviving process restarts without disk I/O",
        "vLLM ships pre-compiled binaries for every supported model, so no compilation ever runs on the serving machine",
      ],
      answerIndex: 0,
      explanation: "Compiling lazily on first use would inject multi-second stalls into unlucky requests, so vLLM front-loads all compilation to startup. Keying the cache on hashes of everything that influences the generated code makes reuse safe: a stale artifact can never silently serve a changed model.",
    },
  ],
  "fa-derivation": [
    {
      prompt: "Why must softmax subtract the row maximum from all logits before exponentiating when computing in fp16?",
      choices: [
        "Subtraction makes the logits sum to zero, which the softmax formula requires",
        "fp16 has limited range (max ~65504), so exp() of even moderately large logits overflows to infinity; shifting by the max makes the largest exponent exp(0)=1 and all others lie in (0,1], and the shift cancels exactly in the numerator and denominator, leaving the result unchanged",
        "It removes the influence of outlier tokens on the attention distribution",
        "fp16 cannot represent negative exponents, so values must be shifted to be positive",
      ],
      answerIndex: 1,
      explanation: "exp(x) exceeds fp16's range once x passes roughly 11, so raw logits routinely overflow. Because softmax(x) = softmax(x − c) for any constant c, subtracting the max is a free numerical fix — but it seems to demand knowing the max before summing, which is exactly the coupling that online softmax and FlashAttention untangle.",
    },
    {
      prompt: "Online softmax fuses the max and sum passes into one, but attention still seems to need a second pass to apply the probabilities to V. What insight collapses the whole attention computation into a single pass over K and V?",
      choices: [
        "The row maximum can be estimated cheaply in advance, so no rescaling is ever needed",
        "The output accumulator O can be updated with unnormalized weights and corrected in flight — multiplied by exp(m_old − m_new) whenever the running max changes — with the division by the final softmax denominator deferred to the very end",
        "The score matrix is stored in shared memory during the first pass and reused in the second",
        "Softmax is replaced by a linear approximation that requires no normalization",
      ],
      answerIndex: 1,
      explanation: "The same rescaling trick that fixes the running sum applies to the running weighted sum of V rows, so partial outputs computed with stale statistics remain correctable rather than wrong. This is what makes one pass sufficient: each K/V tile is read from HBM exactly once and the N-by-N score matrix is never materialized.",
    },
  ],
  "fa-landscape": [
    {
      prompt: "Why can't LLM serving systems simply reuse the fixed-shape attention kernels written for training?",
      choices: [
        "Training kernels compute gradients, which is illegal during inference",
        "Serving requires higher numerical precision than training kernels provide",
        "Training kernels only run on multi-GPU clusters, while serving is single-GPU",
        "A serving batch mixes requests with widely varying sequence lengths whose KV caches live in scattered fixed-size pages; kernels assuming dense, contiguous, uniform-length tensors would force padding to the longest sequence and contiguous KV copies, wasting compute and memory — so serving kernels must handle ragged batches and gather KV through page tables",
      ],
      answerIndex: 3,
      explanation: "Continuous batching and PagedAttention make raggedness and indirection the normal case in serving, not an edge case. Libraries like FlashInfer exist precisely to provide attention kernels that consume page tables and variable-length layouts natively, keeping the memory savings of paging without giving up kernel performance.",
    },
    {
      prompt: "FlashInfer JIT-compiles attention kernels at deployment time rather than shipping one pre-built kernel binary. What motivates this design?",
      choices: [
        "JIT compilation lets the kernel adapt to each request's content at runtime",
        "The space of attention configurations — head dimensions, GQA ratios, masking schemes, positional-encoding fusions, custom score transformations — is too large to pre-compile; JIT generates a kernel specialized for the deployment's exact variant, baking parameters in as constants for full performance while keeping the library extensible",
        "Pre-compiled CUDA binaries cannot legally be redistributed, forcing source-level shipping",
        "JIT avoids the GPU memory cost of loading unused kernel variants",
      ],
      answerIndex: 1,
      explanation: "A generic kernel handling every variant through runtime branches pays for that flexibility on every instruction, and pre-building every combination explodes combinatorially. Compiling once per configuration at startup gets specialized-kernel performance with library-level generality — the same tile/block abstraction (shared across CUTLASS-style and ThunderKittens-style frameworks) is what makes such generation tractable.",
    },
  ],
  "fa-modern-metal": [
    {
      prompt: "What does Hopper's TMA (Tensor Memory Accelerator) change about moving tiles between global and shared memory?",
      choices: [
        "It adds an extra cache level between L2 and shared memory for tensor data",
        "It compresses tiles in transit, effectively doubling memory bandwidth",
        "It automatically coalesces scattered random accesses into sequential ones",
        "A single thread issues a descriptor-based bulk copy, and a dedicated hardware engine performs the whole transfer asynchronously — including address generation and bounds handling — freeing the register file and all other threads from address arithmetic to focus on computation",
      ],
      answerIndex: 3,
      explanation: "Pre-Hopper kernels spent every thread's registers and instruction slots computing per-element addresses for loads; TMA moves that work into a copy engine driven by one thread and a tensor-map descriptor, with completion signaled through an async barrier. This both deepens the async pipeline and releases registers that kernels can spend on larger accumulator tiles.",
    },
    {
      prompt: "Hopper GEMM and attention kernels use warp specialization: some warps only issue TMA loads (producers) while others only run tensor core math (consumers). Why is this better than every warp both loading and computing?",
      choices: [
        "It creates an explicit hardware pipeline: producers keep prefetching future tiles into a multi-buffered shared memory while consumers keep tensor cores busy on current ones, synchronized by async barriers — and register budget can be shifted to the consumer warps that need large accumulators",
        "It halves total register usage because producer warps and consumer warps share register allocations",
        "Tensor core instructions can only be issued by even-numbered warps, forcing the split",
        "It prevents warp divergence, which would otherwise corrupt tensor core results",
      ],
      answerIndex: 0,
      explanation: "When every warp interleaves loads and math, memory stalls and compute contend within each warp's single instruction stream; specialization decouples them into an asynchronous producer/consumer pipeline over a shared-memory ring buffer. Hopper even allows reallocating registers between warp groups, so compute warps get the registers TMA-driven producer warps no longer need.",
    },
    {
      prompt: "Serving a W4A16 model (4-bit weights, fp16 activations) requires special 'mixed-input' GEMM kernels rather than standard ones. Why?",
      choices: [
        "4-bit weights must be stored in texture memory, which standard GEMMs cannot read",
        "Tensor cores require both MMA operands in the same supported type — there is no INT4-times-FP16 mode — so the kernel must dequantize weight tiles to fp16 on the fly (applying scales/zero-points in registers) between loading and the MMA, structured so the upconversion pipeline never starves the tensor cores",
        "Mixed-input GEMMs perform the multiplication in 4-bit and upconvert only the final result",
        "The 4-bit weights are encrypted for license enforcement and must be decoded in-kernel",
      ],
      answerIndex: 1,
      explanation: "The benefit of W4A16 is bandwidth — weights cross the memory bus at 4 bits — but the math still happens in fp16, so a fast in-register upconvert must be fused into the GEMM mainloop. Done naively this conversion becomes the bottleneck, which is why mixed-input kernels (e.g., in CUTLASS and Marlin-style designs) are engineering projects of their own.",
    },
  ],
  "quant-papers": [
    {
      prompt: "How does GPTQ improve on simple round-to-nearest quantization of a weight matrix?",
      choices: [
        "It rounds stochastically, so errors cancel out in expectation across the matrix",
        "It fine-tunes the full model for a few steps after quantization to recover accuracy",
        "It quantizes weights sequentially (column by column) and, after fixing each one, uses approximate second-order (inverse-Hessian) information to update the remaining unquantized weights so they compensate for the error just introduced",
        "It stores the rounding errors in a separate sparse correction matrix applied at inference",
      ],
      answerIndex: 2,
      explanation: "Round-to-nearest treats every weight independently, but the layer's output error depends on weights jointly; GPTQ exploits this by letting still-unquantized weights absorb each quantization step's damage, weighted by curvature of the layer reconstruction loss. This is why GPTQ holds up at 3-4 bits where naive rounding degrades badly, while remaining a one-shot method needing only calibration data.",
    },
    {
      prompt: "AWQ protects roughly 1% of 'salient' weight channels to preserve accuracy. How does it decide which channels are salient, and how does it protect them?",
      choices: [
        "Salience comes from the activation magnitudes flowing through each channel — not from the weights' own magnitudes — and protection uses an equivalent per-channel scaling transformation (scale weights up, inputs down) so the whole matrix stays in uniform low-bit format instead of hardware-unfriendly mixed precision",
        "Channels with the largest weight values are kept in fp16 while the rest are quantized to 4-bit",
        "Salience is computed from gradient magnitudes during a brief fine-tuning run",
        "It measures each channel's contribution to the loss via ablation and keeps the top 1% in fp32",
      ],
      answerIndex: 0,
      explanation: "AWQ's central observation is that a weight's importance is determined by the data it multiplies: channels fed by large activations dominate outputs even when the weights themselves look small. The scaling trick moves those channels away from quantization-sensitive regions mathematically for free, avoiding mixed-precision layouts that fragment memory access and kernel design.",
    },
    {
      prompt: "Why does W4A16 quantization substantially speed up decode but barely help (or even slightly hurt) prefill?",
      choices: [
        "Prefill runs on the CPU, where 4-bit arithmetic has no hardware support",
        "Decode is memory-bandwidth-bound: with few tokens per forward pass, runtime is dominated by streaming the weights, so 4-bit weights cut that traffic roughly 4x. Prefill processes many tokens per weight load and is compute-bound — and since W4A16 still computes in fp16 after dequantization, FLOPs are unchanged and dequantization adds overhead",
        "The KV cache is quantized during decode but not during prefill",
        "Decode kernels can skip zero weights, and quantization creates many zeros",
      ],
      answerIndex: 1,
      explanation: "Weight-only quantization is a bandwidth optimization, so it pays off exactly where arithmetic intensity is low — the one-token-at-a-time decode regime. In compute-bound prefill the tensor cores, not the memory bus, are the bottleneck, and W4A16 leaves the actual math precision (and therefore peak FLOPs) untouched.",
    },
  ],
  "quant-fp8": [
    {
      prompt: "FP8 comes in two flavors: E4M3 and E5M2. Which is generally used for weights and activations in inference, and why?",
      choices: [
        "E5M2, because its wider dynamic range prevents activation outliers from clipping",
        "E5M2, because sharing FP16's five exponent bits makes conversion lossless",
        "Either works identically, since both use 8 bits total",
        "E4M3: with a good scaling factor applied per tensor or block, weights and activations fit in a modest range, so the extra mantissa bit (finer resolution) matters more than extra exponent range; E5M2's wider range mainly earns its keep for training gradients, whose magnitudes vary wildly",
      ],
      answerIndex: 3,
      explanation: "The mantissa-versus-exponent tradeoff should be decided by what scaling can't fix: scaling recenters a tensor's range, but cannot recover resolution lost to a smaller mantissa. Inference tensors are well-behaved after scaling, favoring E4M3's precision; gradients span orders of magnitude within one tensor, which is why E5M2 exists.",
    },
    {
      prompt: "NVFP4 attaches an FP8 (E4M3) scale to every 16-element block, versus MXFP4's power-of-two (E8M0) scale per 32 elements. Why do small blocks with fractional scales matter so much at 4-bit precision?",
      choices: [
        "Smaller blocks let more of the tensor be skipped entirely when values are zero",
        "An E2M1 value has only a handful of representable magnitudes, so a single outlier sharing a scale group crushes the resolution available to every other element; smaller blocks confine each outlier's damage to 16 neighbors, and fractional E4M3 scales fit each block's actual maximum instead of rounding the scale itself to the nearest power of two",
        "FP8 scales can be negative, letting blocks of negative values skip the sign bit",
        "The 16-element block size matches the warp size, enabling one scale per thread",
      ],
      answerIndex: 1,
      explanation: "With ~2 significant bits per value, everything hinges on how well the scale maps each group onto the tiny representable set — so scale granularity and scale precision are where FP4 accuracy is won or lost. NVFP4 spends extra metadata bits (one FP8 scale per 16 values, plus a per-tensor FP32 scale) to buy that locality, which is how it keeps degradation under ~1% on many models.",
    },
    {
      prompt: "A team wants NVFP4 inference speedups on their A100/H100 fleet. What should they understand about hardware support?",
      choices: [
        "Native FP4 tensor core math (consuming block-scaled FP4 operands directly) arrives with Blackwell's fifth-generation tensor cores; on earlier GPUs FP4 can only serve as a storage format — weights are dequantized to a higher precision before the matmul — giving memory and bandwidth savings but no tensor-core throughput gain",
        "Any GPU with FP8 support runs FP4 at double FP8 throughput by packing two values per register",
        "FP4 is implemented in the CUDA driver, so a software update enables it on any architecture",
        "Only inference-dedicated accelerators support FP4; no general-purpose GPU does",
      ],
      answerIndex: 0,
      explanation: "New datatypes deliver full speedups only when the tensor cores natively consume them, including the block-scale handling; Blackwell bakes scale application into the MMA path. On pre-Blackwell hardware FP4 still halves weight storage versus FP8 — useful for capacity and decode bandwidth — but the math runs at the dequantized precision's rate.",
    },
  ],
  "quant-kv": [
    {
      prompt: "What is the primary serving benefit of storing the KV cache in FP8 instead of FP16?",
      choices: [
        "It doubles the tensor core throughput of the attention computation",
        "It halves KV cache bytes per token, so the same GPU memory holds roughly 2x more cached tokens — enabling longer contexts and more concurrent sequences per batch, which raises throughput; attention's memory reads also shrink",
        "It eliminates the need for paged memory management, since the cache fits contiguously",
        "It makes the cache immune to eviction under memory pressure",
      ],
      answerIndex: 1,
      explanation: "KV cache size is often what caps batch size and context length on a serving GPU, and decode throughput scales with how many sequences can run concurrently — so cache capacity converts directly into throughput. Compute speedups are secondary and backend-dependent (e.g., FlashAttention-3 can keep attention in FP8), but capacity is the headline win.",
    },
    {
      prompt: "An engineer enables kv_cache_dtype=\"fp8\" in vLLM with no other changes and observes a noticeable accuracy drop. What is the most likely cause?",
      choices: [
        "FP8 KV caches are incompatible with grouped-query attention models",
        "The KV cache silently fell back to INT8, which cannot represent attention values",
        "FP8 rounds all small values to zero, so long contexts always lose information",
        "Without calibration, the K/V scaling factors default to 1.0, so values are cast into E4M3's narrow range unscaled; computing proper scales from representative calibration data (e.g., via llm-compressor) or using checkpoint-provided scales recovers most of the accuracy",
      ],
      answerIndex: 3,
      explanation: "FP8's usefulness depends almost entirely on scaling values into its representable range; a unit scale ignores the actual K/V distributions and wastes the format's dynamic range or clips it. This is the same lesson as all low-bit formats — the scale factors, not the bit pattern, carry the accuracy — and it is why calibrated scales are the recommended path.",
    },
  ],
  "quant-sparsity": [
    {
      prompt: "Wanda prunes the weights with the smallest |weight| times input-activation-norm score, comparing within each output row. Why does this beat plain weight-magnitude pruning on LLMs — without any retraining?",
      choices: [
        "The activation norm term simply rescales all scores equally, but row-wise comparison is what matters",
        "Multiplying by activations approximates the gradient, effectively performing one step of fine-tuning",
        "LLMs develop emergent outlier features — a few hidden channels with very large activation magnitudes — so a small-magnitude weight multiplying a huge activation still contributes heavily to the output; magnitude-only pruning deletes exactly those weights, while weight-times-activation captures each connection's actual output contribution",
        "Activation norms identify dead neurons, which are the only weights safe to remove",
      ],
      answerIndex: 2,
      explanation: "A weight's effect on the layer output is |w| scaled by what flows through it, and in large LLMs activation scales vary across channels by orders of magnitude — so weight magnitude alone is a badly miscalibrated importance proxy. Wanda needs only a forward pass over calibration data to measure activation norms, matching far costlier Hessian-based methods like SparseGPT with no weight updates at all.",
    },
    {
      prompt: "What does 2:4 semi-structured sparsity mean, and how does hardware turn it into a speedup?",
      choices: [
        "Two of every four layers are removed; the remaining layers run twice to compensate",
        "Weights are stored at 2-bit precision in groups of 4, halving memory traffic",
        "At most 2 nonzeros in every contiguous group of 4 weights; sparse tensor cores (Ampere onward) store just the 2 values plus tiny per-group index metadata, and the hardware skips the zeros — up to 2x MMA throughput and roughly half the weight storage, while keeping perfectly regular memory access",
        "The GPU driver reorders weights so zeros cluster into whole tiles that are skipped",
      ],
      answerIndex: 2,
      explanation: "The fixed 2-of-4 pattern is the key: nonzero positions are describable with 2 bits per pair, so the hardware knows exactly where values are without pointer-chasing, preserving the dense, regular dataflow tensor cores need. It is a constraint chosen for the hardware's benefit — pruning methods like Wanda and SparseGPT can target the 2:4 pattern directly to make models eligible.",
    },
    {
      prompt: "A model pruned to 60% unstructured sparsity (weights zeroed anywhere) runs no faster on GPU than the dense original. Why is this the expected outcome?",
      choices: [
        "Irregular nonzero locations require storing and chasing indices, breaking the coalesced access and dense tile structure that GPU memory systems and tensor cores are built around; general sparse kernels typically need well above ~90% sparsity to beat dense ones, so moderate unstructured sparsity saves neither time nor (in dense storage) memory",
        "The zeros are still stored in fp16, so the GPU cannot detect them at runtime",
        "GPUs cache the dense weight layout at load time and ignore later sparsification",
        "Unstructured sparsity only accelerates training, where gradients are also sparse",
      ],
      answerIndex: 0,
      explanation: "GPU throughput comes from regularity — coalesced loads and fixed-shape tensor core tiles — and arbitrary zero patterns destroy both while adding index metadata and gather overhead. This is precisely why hardware vendors defined constrained patterns like 2:4: enough structure for the hardware to exploit, enough freedom for pruning algorithms to preserve accuracy.",
    },
  ],
  "vllm-trace": [
    {
      prompt: "vLLM V1 runs the OpenAI-compatible API server and the EngineCore in separate processes. What is the main reason for this split?",
      choices: [
        "CPU-heavy serving work (HTTP handling, tokenization, detokenization) is kept out of the process running the GPU busy loop, so the engine's step loop is never blocked; the two communicate asynchronously over IPC",
        "CUDA does not allow a process that owns network sockets to also launch GPU kernels, so serving and execution must be separated",
        "The API server performs sampling on CPU in parallel while the EngineCore runs forward passes, halving per-step latency",
        "It exists purely for fault isolation, so a crash while parsing a malformed request cannot corrupt the model weights in GPU memory",
      ],
      answerIndex: 0,
      explanation: "The frontend does CPU-bound work (request handling, tokenization/detokenization) while EngineCore runs a tight scheduler-forward-sample loop; separating them into processes connected by async IPC keeps slow frontend work from stalling GPU execution and lets each side scale independently.",
    },
    {
      prompt: "A request has just been scheduled for prefill in vLLM. Which component decides which physical KV-cache blocks its keys and values will be written into, and when?",
      choices: [
        "The scheduler's KV-cache manager allocates blocks before the forward pass; the model runner then receives a slot mapping telling the attention kernels exactly where to write",
        "The paged-attention kernel allocates blocks on demand inside the forward pass whenever it runs out of space",
        "The model runner reserves a contiguous region sized for the maximum possible sequence length when the request is admitted",
        "The sampler allocates blocks after each step, since only then is it known whether another token will be generated",
      ],
      answerIndex: 0,
      explanation: "Memory decisions happen in the scheduling phase: the KV-cache manager pulls fixed-size blocks (16 tokens by default) from a free pool and records the request-to-block mapping, and the model runner just builds a slot_mapping so kernels write into pre-assigned slots. Execution never allocates — that separation is what makes paged, continuously-batched execution predictable.",
    },
  ],
  "sgl-paper": [
    {
      prompt: "SGLang's RadixAttention stores cached KV prefixes in a radix tree rather than a flat map keyed by full prompts. What capability does the tree structure add?",
      choices: [
        "A new request can reuse the longest matching partial prefix even when no stored request matches exactly, because tree edges hold token sequences that can be split at the point of divergence",
        "Tree lookups are O(1) while hash-table lookups grow linearly with the number of cached prompts",
        "The tree can also deduplicate identical suffixes across requests, doubling reuse opportunities",
        "GPU tensors can only be referenced from tree nodes, since hash tables cannot hold device memory pointers",
      ],
      answerIndex: 0,
      explanation: "A flat full-prompt key only hits on exact matches, but a radix tree matches incrementally token-by-token and splits an edge where two requests diverge, so any shared partial prefix is reused. Suffix sharing is impossible regardless of structure because KV entries depend on their absolute position and preceding context.",
    },
    {
      prompt: "Instead of first-come-first-served, SGLang sorts the waiting queue so requests with the longest matched cached prefix run first. Why?",
      choices: [
        "It batches requests sharing cached prefixes together before those tree nodes are evicted, approximating a depth-first traversal that provably achieves the optimal cache hit rate offline",
        "Longer-prefix requests have less remaining prefill work, so running them first minimizes average queueing delay like shortest-job-first",
        "It guarantees fairness by preventing short novel requests from monopolizing the batch",
        "Longer prefixes indicate multi-turn conversations, which are given higher priority to protect interactive latency",
      ],
      answerIndex: 0,
      explanation: "Longest-shared-prefix-first ordering is equivalent to visiting the radix tree in DFS order, which SGLang proves yields the optimal hit rate with sufficient cache (their online policy reaches about 96% of it). The goal of the ordering is cache hit rate, not job-length scheduling or fairness.",
    },
    {
      prompt: "The SGLang paper motivates RadixAttention with 'LM programs' — applications making many chained or parallel LLM calls. Why do these workloads gain so much more than independent one-shot requests?",
      choices: [
        "Calls within a program (multi-turn chains, parallel forks, tree search, shared few-shot examples) overlap heavily in their prompt prefixes, yet traditional engines discard the KV cache when each request finishes and recompute that shared context every call",
        "LM programs use smaller specialized models per step, so more of them fit in GPU memory simultaneously",
        "Program calls have identical sequence lengths, which makes static batching optimal",
        "RadixAttention reduces the per-token FLOPs of decoding, and programs generate more tokens than single requests",
      ],
      answerIndex: 0,
      explanation: "Multi-call structures fan out from common context — the agent template, conversation history, or few-shot examples — so retaining KV across request boundaries converts repeated prefill into cache hits. RadixAttention accelerates the prefill of shared context, not the per-token cost of decoding.",
    },
  ],
  "bench-method": [
    {
      prompt: "Why is a benchmark run with one fixed input/output length (say 128/128 tokens) a poor predictor of production performance?",
      choices: [
        "Input length drives prefill cost and KV-cache footprint while output length drives decode time, so workloads like summarization (long-in/short-out) and generation (short-in/long-out) stress entirely different phases than the fixed-length test did",
        "Fixed lengths let the tokenizer cache its output, artificially inflating throughput",
        "Sequence length affects only memory consumption, not latency, so fixed lengths overstate memory needs",
        "Fixed-length runs are non-deterministic because the model may still stop early at an EOS token",
      ],
      answerIndex: 0,
      explanation: "ISL and OSL determine where time and memory go — prefill and KV-cache build-up scale with input, generation time scales with output — so benchmarks should mirror the real use case's length distribution (and set ignore_eos so measured output lengths stay controlled). A 128/128 number transfers to almost no real workload.",
    },
    {
      prompt: "One tool reports ITL and another reports TPOT for the same server, and the numbers disagree. What definitional detail most likely explains the gap?",
      choices: [
        "These metrics describe the decode phase only — e.g., AIPerf computes ITL as (e2e latency − TTFT) / (output tokens − 1), excluding the first token — but tools differ on whether the first token or TTFT is folded in, so numbers are only comparable when the formulas align",
        "ITL is always reported as a p99 percentile while TPOT is always a mean",
        "TPOT includes input-token processing time, whereas ITL covers output tokens only",
        "ITL is measured client-side and TPOT server-side, so the difference is purely network latency",
      ],
      answerIndex: 0,
      explanation: "ITL/TPOT both aim to capture the steady token-to-token pace of decoding, which is why the first token (dominated by prefill) is subtracted out in AIPerf's formula. Because tools disagree on that exact treatment, always check the formula before comparing numbers across tools or vendor claims.",
    },
    {
      prompt: "Why does a credible LLM serving benchmark sweep concurrency from 1 up past the server's max batch size, rather than reporting one throughput measurement?",
      choices: [
        "Latency and throughput trade off as load rises — throughput saturates near the max batch size while per-request latency keeps climbing — so only the full latency-throughput curve reveals which operating points meet a latency target; a single point hides the trade-off entirely",
        "A single measurement is invalid only because of warmup effects, which repeated runs at one concurrency would fix",
        "Sweeping is needed to find the point of maximum GPU power draw for cost modeling",
        "Uncapped request-rate load is preferable to concurrency sweeps because it models real arrivals; sweeps are just a fallback",
      ],
      answerIndex: 0,
      explanation: "Batching more requests raises aggregate throughput but slows each request, so 'X tokens/sec' is meaningless without the latency at which it was achieved — the sweep traces the whole curve. Concurrency is the preferred load control because with open-loop request-rate driving, outstanding requests grow without bound once arrivals exceed capacity.",
    },
  ],
  "surf-templates": [
    {
      prompt: "You format a chat with apply_chat_template but forget add_generation_prompt=True before generating. What is the characteristic failure?",
      choices: [
        "The formatted text ends after the user's message without the tokens that open an assistant turn, so the model may continue the user's message instead of answering it — it is just continuing a token sequence",
        "The tokenizer raises an error because the template requires an assistant message to terminate the chat",
        "The model responds normally but without the system prompt applied",
        "Generation works but stop tokens are ignored, so the model never terminates",
      ],
      answerIndex: 0,
      explanation: "add_generation_prompt appends the header that marks the start of an assistant reply (e.g. '<|im_start|>assistant'), which cues the model that it is now speaking. Without it nothing errors — the model simply sees an unfinished conversation and may extend the user's turn or emit another user message.",
    },
    {
      prompt: "Two chat models are fine-tuned from the same base model but use different chat templates. Why does sending one model prompts formatted with the other's template degrade quality without producing any error?",
      choices: [
        "The wrong control tokens still tokenize into a perfectly valid sequence, but it lies outside the chat format the model was fine-tuned on, so the model performs drastically worse while nothing in the stack can detect the mismatch",
        "The mismatched template produces token IDs outside the model's vocabulary, which get mapped to UNK and lose information",
        "The server rejects unknown role markers, silently dropping those messages from the context",
        "Template mismatch only matters for multi-turn conversations, since single turns contain no control tokens",
      ],
      answerIndex: 0,
      explanation: "Fine-tuning teaches the model to expect specific control tokens (Mistral's [INST] vs Zephyr's <|user|>) around messages, and any text is still a legal input, so the failure mode is silent distribution shift rather than an exception. This is why inference servers must apply the model's own template — and why a related pitfall is duplicating special tokens by tokenizing template output with add_special_tokens left on.",
    },
    {
      prompt: "To force a model to answer in JSON, you end the message list with an assistant message containing '{\"name\": \"' and format with continue_final_message=True. What does this do, and why must add_generation_prompt be off?",
      choices: [
        "It leaves the final assistant message open (stripping end-of-message tokens) so the model continues your prefilled text; add_generation_prompt would instead append tokens starting a brand-new message, so combining them is contradictory and raises an error",
        "It instructs the server to retry generation until output parses as JSON, which conflicts with the streaming that add_generation_prompt enables",
        "It moves the prefill into the system prompt, and add_generation_prompt would duplicate it there",
        "It fine-tunes a lightweight adapter on the prefix, which add_generation_prompt would reset",
      ],
      answerIndex: 0,
      explanation: "Prefilling works because a causal LM continues whatever tokens precede it — leaving the assistant turn unterminated makes the model complete your started reply, steering format and improving instruction adherence. The two flags are opposites (continue the current message vs. open a new one), so transformers errors if both are set.",
    },
  ],
  "surf-tools": [
    {
      prompt: "Why does vLLM require choosing a model-specific parser (--tool-call-parser hermes, mistral, llama3_json, ...) to serve OpenAI-style tool calling?",
      choices: [
        "Each model family is trained to emit tool calls in its own markup and token format, so the server needs a matching parser to extract calls from raw generated text and translate them into the standard tool_calls response fields",
        "Parsers validate the JSON schemas of the tools the client supplies, and schema dialects differ by model family",
        "Larger models generate faster than small ones, so each size tier needs a parser tuned to its token rate",
        "The OpenAI tool-calling spec mandates that servers register one licensed parser per model vendor",
      ],
      answerIndex: 0,
      explanation: "Tool-calling ability is trained into each model with its own conventions — Hermes-style JSON blocks, Mistral's format, Llama's variants — while clients expect one uniform OpenAI-shaped API. The parser is the adapter between the model's idiosyncratic output and the standard interface, which is why using the wrong parser yields text instead of parsed tool calls.",
    },
    {
      prompt: "With tool_choice set to a named function or to \"required\", how does vLLM guarantee the response is a well-formed call matching the schema — unlike tool_choice=\"auto\"?",
      choices: [
        "It applies structured outputs (guided decoding) that constrain token sampling so the output must be valid JSON conforming to the function's parameter schema, whereas auto relies on the model's trained behavior plus parsing",
        "It resamples the completion in a loop until the parser succeeds, then returns the first valid attempt",
        "It routes the request to a special fine-tuned function-calling adapter loaded alongside the base model",
        "The tool-call parser repairs malformed JSON after generation by inserting missing braces and quotes",
      ],
      answerIndex: 0,
      explanation: "Named and required modes turn tool calling into constrained generation: the structured-outputs backend masks invalid tokens at every step, making schema conformance a guarantee rather than a probability. Under auto the model freely decides whether and how to call, so output validity depends on the model and the parser.",
    },
  ],
  "surf-security": [
    {
      prompt: "A multi-tenant inference server enables automatic prefix caching shared across all users. How can one tenant learn about another tenant's prompts without ever seeing their data?",
      choices: [
        "By sending a guessed prefix and timing TTFT: a noticeably faster response means the prefix's KV blocks were already cached, revealing that some other user recently submitted a prompt starting with those tokens",
        "By reading the cached KV tensors through the API and decoding them back into the original prompt text",
        "Because a cache hit changes the generated tokens, exposing fragments of the other tenant's completion",
        "Only if verbose logging is enabled, since the cache itself emits no observable signal",
      ],
      answerIndex: 0,
      explanation: "A prefix-cache hit skips prefill compute, so the latency difference itself is the leak — an attacker can confirm guesses about other users' prompts (even extending them block by block) purely through timing. No cached data is ever returned; the side channel is the observable speedup.",
    },
    {
      prompt: "How does vLLM's cache_salt parameter mitigate the prefix-cache timing side channel?",
      choices: [
        "The salt is injected into the hash of the first KV block — and thus propagates through every subsequent block's chained hash — so only requests carrying the same salt can hit each other's cached blocks, confining reuse to a trust group",
        "It adds random jitter to TTFT so cache hits and misses become statistically indistinguishable",
        "It encrypts KV-cache entries at rest so other tenants cannot decrypt them",
        "It disables prefix caching for any request marked sensitive while leaving other traffic cached",
      ],
      answerIndex: 0,
      explanation: "Block hashes chain each block's tokens with its prefix hash, so salting the first block partitions the entire cache keyspace by salt: cross-tenant probes can never hit, while requests within the same salt group keep full caching benefits. It closes the side channel by preventing cross-boundary sharing, not by masking timing.",
    },
    {
      prompt: "You start a vLLM OpenAI-compatible server with --api-key and expose it on your network. Which surface remains reachable without the key?",
      choices: [
        "Endpoints outside the /v1 API such as /health and /metrics, so operational data like usage and cache statistics still needs protection at the network or proxy layer",
        "Nothing — the API key middleware authenticates every route the server registers",
        "Only completions with streaming enabled, since SSE connections bypass header checks",
        "The /v1/models listing, because model discovery is defined as a public endpoint",
      ],
      answerIndex: 0,
      explanation: "vLLM's API-key check applies to the /v1 inference routes; probes, health checks, and Prometheus metrics stay open so orchestrators can reach them. Treat the server as an internal component behind a gateway — metrics can reveal traffic patterns, and unauthenticated surfaces should never face untrusted networks.",
    },
  ],
  "obs-otel": [
    {
      prompt: "What is the core operational payoff of the OpenTelemetry GenAI semantic conventions standardizing attribute names like gen_ai.operation.name and gen_ai.usage.input_tokens?",
      choices: [
        "Telemetry from any instrumented provider or serving stack carries identical field names, so one set of dashboards, alerts, and cost queries works across vendors — and swapping model providers doesn't mean rebuilding observability",
        "Standardized names compress better, significantly reducing telemetry storage and export volume",
        "Providers require these exact attribute names in request headers to meter billing correctly",
        "The conventions ensure prompt contents are hashed before export, guaranteeing telemetry privacy",
      ],
      answerIndex: 0,
      explanation: "Semantic conventions are a shared vocabulary: if OpenAI, Bedrock, and a self-hosted vLLM all report gen_ai.usage.input_tokens under the same name, cross-vendor aggregation, cost attribution, and tooling become plug-and-play, with gen_ai.provider.name as the discriminator. Without the standard, every backend needs bespoke mappings per instrumentation.",
    },
    {
      prompt: "Under the GenAI conventions, how is one chat completion call to an external model API represented in a trace?",
      choices: [
        "As a single client span named like \"chat gpt-4\" (\"{operation} {model}\") covering the whole call including retries, with request/response model and gen_ai.usage input/output token counts attached as attributes",
        "As one span per generated token, so inter-token latency can be reconstructed from span boundaries",
        "As two sibling spans — one for the prompt, one for the completion — joined by a span link",
        "Only as metrics; spans are reserved for multi-step agent workflows",
      ],
      answerIndex: 0,
      explanation: "The model is span-per-logical-operation: one CLIENT span spans the entire inference call, with the low-cardinality name pattern keeping spans groupable and token usage recorded as span attributes (mirrored by the token-usage metric). That per-call granularity is what lets you attribute latency and token cost to individual requests within a larger trace.",
    },
  ],
  "econ-inferencemax": [
    {
      prompt: "InferenceMAX publishes latency-throughput Pareto frontier curves per hardware/software stack instead of one throughput number. What does a single peak-throughput figure hide?",
      choices: [
        "That per-GPU throughput and per-user speed trade off against each other — peak throughput comes from batching many users at low interactivity, so a single number says nothing about what the system delivers under a real per-user latency target",
        "Run-to-run variance, which the frontier eliminates by averaging many trials",
        "Network overheads between nodes, which only appear at low batch sizes",
        "Power consumption, which is the true limit on deployable throughput",
      ],
      answerIndex: 0,
      explanation: "Serving fewer concurrent users makes each one fast but wastes GPU throughput, and vice versa; the Pareto frontier maps the achievable throughput at every interactivity level. Any throughput claim is meaningful only alongside the operating point (tokens/s/user) at which it was measured.",
    },
    {
      prompt: "Chip A is cheaper per million tokens than chip B when measured at each chip's maximum throughput. Why can this cost ranking flip in production, and what makes a fair comparison?",
      choices: [
        "Because $/M tokens is GPU-hour cost divided by throughput at the chosen operating point, and throughput falls as the interactivity SLO tightens — each chip's curve falls differently — valid comparisons must fix the same tokens/s/user SLO on both chips",
        "Because hourly rental prices fluctuate, so cost rankings are only stable when hardware is purchased outright",
        "Because max-throughput measurements ignore prefill, which dominates production traffic",
        "It cannot flip: the chip with higher peak throughput is always cheaper per token at any latency target",
      ],
      answerIndex: 0,
      explanation: "Tightening the per-user speed requirement forces smaller batches and lower per-GPU throughput, raising cost per token — and hardware/software stacks degrade at different rates along that curve. Comparing chips at different SLOs (or each at its own best point) measures the choice of operating point, not the hardware.",
    },
  ],
  "elas-autoscale": [
    {
      prompt: "Why does GPU utilization mislead as an autoscaling signal for LLM serving?",
      choices: [
        "Utilization counts a sample window as busy if any kernel ran at all, so a replica decoding a single request at batch size 1 can report near-100% while enormous batch capacity sits unused — triggering scale-ups the fleet doesn't need",
        "GPU utilization can't be sampled frequently enough for autoscaling loops, which need sub-second signals",
        "Utilization only measures memory bandwidth, and LLM inference is compute-bound",
        "Utilization is accurate but lags demand, which a longer averaging window fixes",
      ],
      answerIndex: 0,
      explanation: "The 'utilization' counters report kernel-active time, not how much of the chip's batch/throughput capacity is consumed, so a lightly loaded LLM replica looks saturated. Scaling on it burns money on premature scale-ups while telling you nothing about real remaining headroom.",
    },
    {
      prompt: "Why is in-flight request concurrency a better autoscaling signal for LLM services than QPS?",
      choices: [
        "Request cost varies wildly with input and output length, so QPS doesn't map to load; concurrency equals arrival rate times request duration (Little's Law), automatically capturing expensive long generations, and it maps directly onto each replica's batch capacity for setting targets",
        "QPS is the better signal in principle but is much harder to measure at the gateway than concurrency",
        "Concurrency predicts future traffic spikes before they arrive, while QPS is purely reactive",
        "QPS fails mainly because clocks skew across replicas, corrupting the rate calculation",
      ],
      answerIndex: 0,
      explanation: "A 50-token response and a 5,000-token response are the same one 'query' but occupy the engine for vastly different times; in-flight count folds that duration in (L = λW), measuring work actually resident in the system. It also gives a natural scaling rule: replicas needed ≈ total in-flight / per-replica concurrency limit.",
    },
    {
      prompt: "A scale-up event launches a new replica serving a large model. On a platform with optimized container infrastructure, which cold-start stage typically dominates?",
      choices: [
        "Getting model weights into the GPU and the engine initialized — tens to hundreds of GB moving through the mostly sequential remote-storage → disk → host-memory → GPU path, plus engine startup work — while container boot itself can be under a second",
        "Container image pull, since engine images are large and registries throttle; weight loading overlaps with it for free",
        "Cluster scheduling and bin-packing, which grows linearly with cluster size",
        "TLS handshakes and service-mesh registration for the new replica",
      ],
      answerIndex: 0,
      explanation: "Provisioning and image pull are real costs but are addressable with warm pools and caching; the stubborn tail is streaming huge weight files through a pipeline with little parallelism, then engine init before the replica serves. That's why mitigations target this stage specifically — pre-staged weights, streaming loaders, and snapshots — and why scale-to-zero trades cold-start minutes for idle savings.",
    },
  ],
  "elas-decide": [
    {
      prompt: "A team is choosing between a serverless token API and self-hosting on rented GPUs. What is the pivotal variable in the cost crossover?",
      choices: [
        "Utilization: self-hosted GPUs cost the same idle or busy while APIs charge linearly per token, so steady high volume amortizes the fixed GPU cost below API pricing — but spiky or low traffic leaves paid GPUs idle and the API wins",
        "Model size: below 70B parameters self-hosting is always cheaper, above it APIs always win",
        "Provider economies of scale, which keep token APIs cheaper than self-hosting at any volume",
        "Engineering headcount: self-hosting is cheaper per token from day one but requires an ops team to unlock",
      ],
      answerIndex: 0,
      explanation: "The comparison is fixed cost versus variable cost: per-token API spend scales linearly with usage, while self-hosted per-token cost drops as the same GPUs serve more traffic. High sustained utilization is what pushes self-hosting under the API price — volume and traffic shape, not model size, decide the crossover.",
    },
    {
      prompt: "When does BYOC (bring your own cloud) hit the sweet spot between a managed serverless API and fully self-managed infrastructure?",
      choices: [
        "When data must stay inside your own cloud account/VPC for compliance and you want to burn existing cloud commitments, but you don't want to build and operate the serving stack — the vendor's control plane manages inference running in your environment",
        "When you own physical hardware and want to install it in the vendor's data center for lower latency",
        "When traffic is too spiky for self-hosting, since BYOC bills purely per token like serverless",
        "When you need custom CUDA kernels, which managed control planes otherwise prohibit",
      ],
      answerIndex: 0,
      explanation: "BYOC splits the stack: compute and data stay in your cloud (satisfying residency and drawing down committed spend) while the vendor supplies the operational layer. You still pay for the underlying GPUs, so it inherits self-hosting's utilization economics rather than serverless's pure pay-per-token model.",
    },
    {
      prompt: "Back-of-envelope: what GPU memory do the weights alone of a 70B-parameter model in FP16 require, and what follows for deployment?",
      choices: [
        "About 140 GB (2 bytes per parameter), plus roughly 10-30% more for KV cache and runtime overhead — so it exceeds a single 80 GB GPU and needs multi-GPU serving or quantization",
        "About 70 GB, since FP16 stores one byte per parameter, so it fits a single 80 GB H100",
        "About 280 GB, because serving also keeps gradient and optimizer copies resident alongside the weights",
        "About 140 GB on disk, but only the active layer must be GPU-resident, so a 24 GB card suffices with layer streaming",
      ],
      answerIndex: 0,
      explanation: "The rule is parameters × bytes-per-parameter (FP16 = 2 bytes), then add headroom because KV cache — usually the largest runtime overhead — plus activations and workspace grow with batch and context length. Gradients and optimizer state are training-only costs, and layer streaming is far too slow for production serving.",
    },
  ],
  "elas-routing": [
    {
      prompt: "A multi-turn chat service runs N identical replicas with per-replica prefix caching behind a round-robin load balancer. Why does routing itself waste GPU compute, and what fixes it?",
      choices: [
        "Each follow-up turn has only ~1/N odds of landing on the replica holding that conversation's KV cache, forcing full prefix recomputation and a TTFT spike on misses; prefix-aware routing (session affinity, consistent hashing on the prefix, or router-tracked cache state) sends turns to the replica with the cache",
        "Round-robin distributes request counts unevenly under bursty traffic, overloading some replicas",
        "Round-robin is fine because replicas automatically replicate their prefix caches to each other in the background",
        "The waste comes from connection re-establishment; HTTP keep-alive to a fixed replica solves it",
      ],
      answerIndex: 0,
      explanation: "Prefix caches live per-replica, so the routing decision determines whether the accumulated conversation context is a cache hit or a from-scratch prefill — cache-blind policies throw away most reuse by construction. Making the router prefix-aware recovers it; replicas do not magically share KV state.",
    },
    {
      prompt: "Why do production LLM routers combine cache-affinity with load signals (queue depth, KV memory occupancy) instead of always routing to the replica with the longest cached prefix?",
      choices: [
        "A cache hit on a saturated replica can be slower end-to-end than a smaller hit — or a recompute — on one with headroom, so the router must weigh prefill tokens saved against queueing delay and memory pressure",
        "Cache-affinity signals are too stale to ever be useful, so load signals should simply override them",
        "Longest-prefix routing is provably optimal cluster-wide, so load signals exist only for prefill/decode-disaggregated setups",
        "Load signals exist to keep request counts equal across replicas, which matters more than cache reuse",
      ],
      answerIndex: 0,
      explanation: "Chasing cache hits can herd traffic onto hot replicas where queueing and KV-memory pressure erase the saved prefill time, so good routers optimize predicted total latency, not hit rate. (SGLang's optimality result is about scheduling order within one engine, not about cluster-level routing.)",
    },
    {
      prompt: "A gateway's semantic cache returns a stored completion when a new prompt's embedding is close to a previous one. What risk does this carry that exact prefix/KV caching does not?",
      choices: [
        "Embedding similarity can match prompts that differ in a critical detail (a negation, a number, a different entity), silently serving a wrong or stale answer — whereas prefix caching reuses computation only on exact token matches and never alters outputs",
        "Semantic caching consumes GPU memory that would otherwise hold KV cache, degrading throughput",
        "Semantic caching increases TTFT because the embedding lookup runs before generation starts",
        "It is equivalent to prefix caching but stored on CPU, so the only risk is slower hits",
      ],
      answerIndex: 0,
      explanation: "Semantic caching trades correctness for cost: it skips generation entirely based on a similarity threshold, so 'invoice #1041' can receive the cached answer for 'invoice #1014'. Prefix/KV caching is a pure computation-reuse optimization on identical tokens — the model still generates the response, so outputs are unaffected.",
    },
  ],
  "par-scaling-book": [
    {
      prompt: "During decode, an engineer sees a model's linear layers running far below peak FLOPs. Roughly what total token batch size makes those matmuls compute-bound, and why that particular number?",
      choices: [
        "A batch equal to the number of SMs or tensor cores, so every compute unit has a tile of work assigned to it",
        "A batch of tokens roughly equal to the hardware's ops:byte ratio (a few hundred, e.g. ~240 in bf16), because every weight byte loaded from HBM must be reused across that many tokens before compute time exceeds weight-loading time",
        "A batch large enough that the KV cache fills all remaining HBM, since attention dominates decode cost",
        "There is no such threshold: decode matmuls stay memory-bound at any batch size, so batching only helps fairness",
      ],
      answerIndex: 1,
      explanation: "Weights are loaded once per step and reused for every token in the batch, so arithmetic intensity roughly equals the token batch size; once it exceeds the accelerator's FLOPs-to-bandwidth ratio (~240 for bf16 on a TPU v5e, similar on H100), the matmul flips from memory-bound to compute-bound.",
    },
    {
      prompt: "Why is the decode/generation phase fundamentally harder to make hardware-efficient than prefill, even with a good serving stack?",
      choices: [
        "Decode kernels are less mature than fused prefill kernels, so the gap is an engineering artifact that better kernels will close",
        "Prefill results can be prefix-cached while decode must recompute attention over the whole sequence at every step",
        "Each request contributes only one token per step, so reaching the compute-bound batch threshold requires batching many concurrent requests — and decode attention stays memory-bound regardless, streaming a large KV cache to perform very few FLOPs per token",
        "Decode requires higher-precision accumulation than prefill, halving its effective FLOPs",
      ],
      answerIndex: 2,
      explanation: "Prefill gets hundreds of tokens of parallelism for free from the prompt itself, while decode must assemble its batch from separate concurrent requests; even then, attention during decode loads each request's entire KV cache to compute one token, keeping its arithmetic intensity near 1.",
    },
    {
      prompt: "How should you think about batch size when tuning an inference deployment for both cost and user experience?",
      choices: [
        "Larger batches amortize weight loading across more tokens, improving throughput and cost per token, but each step also loads more KV cache and takes longer — so batch size selects a point on a latency-throughput Pareto frontier",
        "Larger batches improve both latency and throughput until memory runs out, so always run the largest batch that fits",
        "Latency is set by model size and hardware alone, so batch size is purely a throughput knob with no latency effect",
        "Smaller batches are always cheaper per token because they generate less total memory traffic per step",
      ],
      answerIndex: 0,
      explanation: "Throughput and per-token cost improve with batch size (with diminishing returns), but step time grows because KV cache loading scales with the batch, so latency degrades; serving is about choosing where on that frontier your SLOs require you to sit.",
    },
  ],
  "par-megatron": [
    {
      prompt: "In Megatron-LM's tensor-parallel MLP, the first GEMM is split column-wise and the second row-wise, needing only one all-reduce in the forward pass. Why does this ordering work, while splitting the first GEMM row-wise would not?",
      choices: [
        "Column splitting halves the volume of each all-reduce, so it is preferred purely for bandwidth reasons",
        "A row-first split would break dimension alignment between the two GEMMs, forcing an extra transpose",
        "Column-first allows the two GEMMs and the GeLU to be fused into a single kernel per GPU",
        "GeLU is nonlinear: a column split gives each GPU complete output columns it can apply GeLU to locally, whereas a row split yields partial sums that must be all-reduced before GeLU, since GeLU(X1A1 + X2A2) != GeLU(X1A1) + GeLU(X2A2)",
      ],
      answerIndex: 3,
      explanation: "The column split keeps each partition's pre-activation values complete (not partial sums), so the nonlinearity commutes with the partitioning; the row-parallel second GEMM then consumes those partitioned activations directly, deferring the single all-reduce to after the second GEMM.",
    },
    {
      prompt: "Why do attention heads form a natural tensor-parallelism boundary in Megatron-LM?",
      choices: [
        "Each head's Q/K/V projections, score matrix, and softmax depend on no other head, so assigning whole heads to GPUs keeps the entire attention computation local, with just one all-reduce after the row-parallel output projection",
        "The number of heads conveniently equals the number of GPUs in typical clusters, making the mapping trivial",
        "Splitting inside a head is impossible because it would change attention's numerical result",
        "Per-head KV caches must live on separate GPUs to avoid memory-bank contention during decode",
      ],
      answerIndex: 0,
      explanation: "Multi-head attention is embarrassingly parallel across heads — softmax normalizes within each head, never across heads — so a per-head partition needs no communication until the partial outputs of the row-split output projection are summed.",
    },
  ],
  "par-collectives": [
    {
      prompt: "A ring all-reduce over N GPUs transfers 2(N-1)/N x data_size per GPU. What is the practical implication of this formula for scaling out?",
      choices: [
        "Per-GPU traffic grows linearly with N, so all-reduce time doubles whenever the cluster doubles",
        "Per-GPU traffic approaches a constant 2x the data size as N grows, so the bandwidth cost barely rises with GPU count — but the number of sequential steps, and thus the latency term, grows linearly with N",
        "The communication cost becomes independent of message size once N is large enough",
        "Each GPU's cost shrinks as N grows because the reduction work is divided, so bigger rings are strictly better",
      ],
      answerIndex: 1,
      explanation: "2(N-1)/N saturates at 2 as N grows, making ring all-reduce bandwidth-optimal at any scale; what scales badly is the 2(N-1) sequential steps, whose fixed per-step latency dominates for small messages or large rings.",
    },
    {
      prompt: "Why do distributed training and inference frameworks fuse many small tensors into large buckets before launching an all-reduce?",
      choices: [
        "Fused buckets are compressed more effectively before hitting the network",
        "Fewer buckets means fewer total bytes are sent over the wire",
        "Small messages are latency-dominated — fixed per-step overhead across the ring's many hops swamps actual transfer time — so fusing moves communication into the bandwidth-bound regime where link throughput is actually utilized",
        "Large buckets allow the summation itself to run on tensor cores instead of the copy engines",
      ],
      answerIndex: 2,
      explanation: "Every collective step pays a fixed latency regardless of payload, so a tiny tensor uses almost none of the link's bandwidth; batching tensors amortizes that overhead until the transfer is limited by bandwidth rather than latency.",
    },
    {
      prompt: "What does it actually take for compute/communication overlap to hide the cost of a collective operation?",
      choices: [
        "Nothing special — GPUs execute asynchronously, so communication is always hidden automatically",
        "Overlap reduces the number of bytes transferred because compute and communication share the memory bus",
        "Overlap only helps for small latency-bound messages; large transfers cannot be overlapped",
        "There must be enough independent computation to run concurrently with the transfer, and the communication time must be shorter than that compute time — overlap hides communication cost, it never eliminates it",
      ],
      answerIndex: 3,
      explanation: "Overlap is a scheduling trick: the bytes still move, but behind computation that does not depend on them; if communication outlasts the available independent compute, the remainder stalls the pipeline anyway.",
    },
  ],
  "dis-distserve": [
    {
      prompt: "Beyond prefill/decode interference itself, what structural problem does colocating both phases on the same GPUs create for capacity planning?",
      choices: [
        "Resource allocation and parallelism become coupled: you cannot add prefill capacity for a prompt-heavy workload without also paying for decode capacity, nor choose tensor parallelism for prefill's TTFT while using a different strategy suited to decode",
        "Colocation forces the KV cache to be stored twice, once for each phase, doubling memory pressure",
        "Colocation makes continuous batching impossible, forcing static request batches",
        "Colocation requires prefill to run at decode's small batch size, leaving prefill memory-bound",
      ],
      answerIndex: 0,
      explanation: "When one replica serves both phases, replica count and parallelism configuration are single knobs shared by two workloads with different optima; disaggregation lets each phase scale and parallelize independently to hit its own SLO.",
    },
    {
      prompt: "A serving system reports 10 requests/second of raw throughput, yet DistServe would call its useful capacity 3 requests/second. What explains this divergence?",
      choices: [
        "Goodput subtracts requests that errored out or were dropped by the scheduler",
        "Goodput counts output tokens rather than requests, so long responses deflate the number",
        "Goodput counts only requests completed within both the TTFT and TPOT SLOs; a throughput-maximizing configuration can batch so aggressively that most responses violate latency targets, so 10 rps of work yields only 3 rps of SLO-compliant service",
        "The gap is measurement noise that disappears as load increases, since throughput and goodput converge at saturation",
      ],
      answerIndex: 2,
      explanation: "Throughput measures work done while goodput measures work done within latency targets; because tuning for one can actively hurt the other (bigger batches raise throughput but inflate TTFT/TPOT), per-GPU goodput is the metric capacity planning should maximize.",
    },
  ],
  "dis-mooncake": [
    {
      prompt: "Mooncake describes itself as \"KVCache-centric.\" What does treating the KV cache as the first-class resource actually change about scheduling?",
      choices: [
        "It pins the entire KV cache in GPU HBM to guarantee the lowest possible access latency",
        "Request routing and instance selection revolve around where reusable cache lives: prefill work is steered toward nodes holding the longest matching prefix in a distributed cache pool, because a cache hit replaces expensive prefill recomputation with cheap memory transfer",
        "It compresses KV entries so that cache size no longer constrains batch size",
        "It schedules purely on GPU utilization, treating any prefix-cache hits as an incidental bonus",
      ],
      answerIndex: 1,
      explanation: "Instead of balancing raw compute load, the scheduler optimizes cache reuse across a disaggregated pool — trading transfer and placement decisions against recomputation — since reused prefixes directly eliminate prefill FLOPs and cut TTFT.",
    },
    {
      prompt: "What is the economic logic behind Mooncake spilling KV cache into CPU DRAM and SSD across the cluster?",
      choices: [
        "The SSD tier primarily checkpoints model weights so failed nodes recover faster",
        "DRAM acts as swap space that lets decode run larger batches than HBM allows",
        "Tiering lets operators buy cheaper GPUs with less HBM in the first place",
        "Idle DRAM and SSD on existing GPU servers are nearly free capacity; storing far more reusable KV there raises cache hit rates, and every hit avoids redoing a prefill on scarce GPU compute — a win whenever loading the cache is cheaper than recomputing it",
      ],
      answerIndex: 3,
      explanation: "The insight is resource arbitrage: prefill compute is the expensive, contended resource, while cluster DRAM/SSD capacity is already paid for and underused, so a much larger cache tier converts cheap storage bandwidth into saved GPU FLOPs.",
    },
    {
      prompt: "Under heavy overload, why does Mooncake reject some requests at admission time rather than accepting everything and letting queues absorb the load?",
      choices: [
        "It predicts whether a request can still meet its TTFT/TBT SLOs and rejects it before prefill runs, so GPU time is never burned producing results that would be SLO-violating anyway — raising effective goodput under overload",
        "It rejects requests after prefill completes, since decode-queue pressure can only be measured at that point",
        "It preferentially kills the longest-running decodes to free memory for new arrivals",
        "It switches to lower numerical precision under load and rejects requests that opt out of it",
      ],
      answerIndex: 0,
      explanation: "Work that will miss its SLO is wasted work; predicting violations early — before any prefill compute is spent — keeps the cluster's capacity focused on requests that will count, which let the Kimi service absorb roughly 75% more requests.",
    },
  ],
  "dis-dynamo": [
    {
      prompt: "A team is assembling a disaggregated serving stack from open-source parts. Which statement correctly assigns each component's layer of responsibility?",
      choices: [
        "NIXL performs KV-aware routing while Dynamo is the byte-transfer plane between GPUs",
        "llm-d is a KV cache tiering library and LMCache is the Kubernetes operator that deploys it",
        "Dynamo is datacenter-scale orchestration (KV-aware routing, disaggregated prefill/decode coordination, SLA-driven planning) over any engine; NIXL is the low-level transfer library moving KV/data across NVLink, RDMA, and storage; LMCache handles KV cache offload and tiering beyond GPU memory; llm-d packages disaggregated serving as Kubernetes-native primitives",
        "Dynamo replaces vLLM and SGLang with its own engine, while NIXL provides the OpenAI-compatible frontend",
      ],
      answerIndex: 2,
      explanation: "Each project owns one layer of the stack — orchestration/routing (Dynamo), point-to-point KV transfer (NIXL), cache offload/tiering (LMCache), and Kubernetes-native packaging (llm-d) — and they compose rather than compete with the inference engines beneath them.",
    },
    {
      prompt: "Why is Dynamo deliberately engine-agnostic, coordinating vLLM, SGLang, or TensorRT-LLM workers rather than shipping its own engine?",
      choices: [
        "Because inference engines are too slow at HTTP handling, and Dynamo's value is a faster frontend",
        "Because single-GPU/single-node token generation and datacenter-scale concerns — routing on KV cache state, coordinating disaggregated prefill/decode, transferring caches, SLA-driven scaling — are separable problems, so one orchestration layer can serve whichever engine wins on kernels",
        "So operators can hot-swap the engine mid-request without dropping the stream",
        "Because Dynamo re-implements attention kernels generically and only needs engines for tokenization",
      ],
      answerIndex: 1,
      explanation: "Engines optimize execution on a node while Dynamo owns the cross-node control plane; keeping the layers decoupled means routing, disaggregation, and scaling logic survive engine churn instead of being rebuilt per engine.",
    },
  ],
  "dis-moe": [
    {
      prompt: "For a fine-grained MoE model like DeepSeek-V3 (hundreds of small experts), why does wide expert parallelism outperform scaling up tensor parallelism across the same GPUs?",
      choices: [
        "EP keeps every expert's GEMMs intact — each expert's weights live whole on a device and only the routed tokens move via all-to-all — whereas high-degree TP would slice each already-small expert into slivers with awkwardly small, misaligned dimensions, wrecking GEMM efficiency on every GPU",
        "EP eliminates inter-GPU communication entirely, while TP requires all-reduces",
        "EP replicates all experts on every GPU so routing never crosses devices",
        "TP cannot express MoE layers because expert outputs cannot be all-reduced correctly",
      ],
      answerIndex: 0,
      explanation: "The choice is between sharding weights (TP) and routing tokens (EP): with many small experts, TP fragments matrices below efficient GEMM sizes, while EP preserves whole-expert matmuls and pays instead with all-to-all token exchange — a cost that can be balanced and overlapped.",
    },
    {
      prompt: "Why does large-scale expert parallelism need an Expert Parallelism Load Balancer (EPLB), and how does it restore balance?",
      choices: [
        "Experts have different parameter counts, so EPLB equalizes memory usage across GPUs",
        "EPLB retrains the router network online to force a uniform token distribution",
        "EPLB drops tokens destined for overloaded experts so no GPU exceeds its budget",
        "MoE layers synchronize at each all-to-all, so every rank waits for the most-loaded GPU; since routing is skewed toward hot experts, EPLB replicates hot experts as redundant copies and re-packs expert placement from observed routing statistics to even out per-GPU token load",
      ],
      answerIndex: 3,
      explanation: "With synchronous all-to-alls, one GPU hosting a hot expert gates the whole step, so imbalance directly wastes cluster-wide compute; duplicating hot experts and clustering cold ones — driven by workload statistics — narrows the gap to the slowest rank.",
    },
    {
      prompt: "How does two-batch overlap (TBO) deal with the all-to-all communication cost inherent to expert parallelism?",
      choices: [
        "It doubles the global batch so each all-to-all carries twice the tokens, amortizing its latency",
        "It splits a batch into two microbatches whose stages interleave, so one microbatch's expert computation runs while the other's all-to-all dispatch/combine is in flight — hiding communication behind compute and also lowering peak activation memory",
        "It overlaps a prefill batch with a decode batch on the same GPU to fill communication gaps",
        "It compresses token representations before dispatch so the all-to-all finishes faster",
      ],
      answerIndex: 1,
      explanation: "TBO is pipelining within a batch: alternating two microbatches keeps the GPU computing during each all-to-all rather than stalling, which is a large part of how the 96xH100 deployment approached DeepSeek's reported efficiency.",
    },
  ],
  "dis-ring": [
    {
      prompt: "How does Ring Attention distribute a very long sequence across devices without paying a communication penalty?",
      choices: [
        "Devices exchange query blocks around the ring while KV blocks stay put, which requires approximating the softmax",
        "Each device computes exact attention only over its local block and a sparse sample of remote blocks",
        "Each device holds its query block fixed and computes attention against whichever KV block it currently has, while simultaneously passing that KV block onward and receiving the next; when per-block compute time exceeds transfer time, communication is fully hidden and context capacity grows linearly with device count — with no approximation",
        "KV blocks are recomputed from checkpoints on each device instead of being transferred at all",
      ],
      answerIndex: 2,
      explanation: "Because each device always has useful work (attending its queries to the resident KV block) while the next block is in flight, the ring transfer overlaps with compute; adding devices adds both memory and compute, so maximum context length scales with the ring size.",
    },
    {
      prompt: "Softmax normalizes over an entire row of attention scores. What makes it possible for Ring Attention to nonetheless process KV blocks one at a time?",
      choices: [
        "Online (blockwise) softmax: maintaining a running maximum and running denominator lets partial outputs from each KV block be rescaled and accumulated incrementally, so the exact final attention emerges without ever materializing the full score matrix",
        "Each block's softmax is computed independently and the block outputs are simply averaged",
        "An initial all-reduce distributes the global row maximum so every device can normalize locally in one pass",
        "The blocks are visited in an order that makes the softmax denominator monotonically stable",
      ],
      answerIndex: 0,
      explanation: "The same trick behind FlashAttention — carrying a running max and normalizer and rescaling previous partial results as new blocks arrive — turns a seemingly global softmax into an associative streaming computation, which is exactly what lets KV blocks circulate.",
    },
  ],
  "dis-k8s": [
    {
      prompt: "Why do classic L7 load-balancing strategies like round-robin or least-connections perform poorly in front of LLM inference replicas?",
      choices: [
        "The main difference is payload size — LLM responses need larger proxy buffers",
        "LLM streaming runs over UDP-like transports that traditional load balancers cannot track",
        "Sticky sessions solve the problem, since pinning each user to one replica preserves all needed state",
        "LLM requests are long-lived streams whose cost varies by orders of magnitude with unpredictable output length, and replicas differ in queue depth and cached prefixes — so balancing connection counts says little about real load, while routing on live engine metrics and KV/prefix-cache locality directly improves TTFT and tail latency",
      ],
      answerIndex: 3,
      explanation: "Connection count is a poor proxy for load when one request may cost 100x another and hold its stream for minutes; the router needs model-server signals (queue depth, cache state) because the best endpoint depends on what each replica is doing and caching right now.",
    },
    {
      prompt: "What does the Gateway API Inference Extension's InferencePool with its endpoint picker (EPP) add over a plain Kubernetes Service in front of model servers?",
      choices: [
        "It caches complete LLM responses at the gateway so repeated prompts skip the backend",
        "It replaces the Service's uniform selection with delegated endpoint choice: the gateway calls the EPP via Envoy's ext-proc protocol, and the EPP picks a pod using live serving metrics — queue depth, KV cache utilization, loaded LoRA adapters — plus model identity and serving priority",
        "It merges concurrent user requests into engine-level batches before forwarding them",
        "It replaces the engine's internal continuous-batching scheduler with a cluster-wide one",
      ],
      answerIndex: 1,
      explanation: "InferencePool makes the backend set model-aware and moves endpoint selection into an extension that reads real-time model-server state, turning any ext-proc-capable Gateway (Envoy Gateway, kgateway, GKE Gateway) into an inference-aware router without touching the engines.",
    },
    {
      prompt: "How does Kubernetes Dynamic Resource Allocation (DRA) change GPU scheduling compared to the traditional device-plugin model?",
      choices: [
        "DRA replaces the GPU Operator by installing drivers and the container toolkit itself",
        "DRA schedules the same integer GPU counts as the device plugin, just with lower latency",
        "The device plugin advertises GPUs only as opaque counts (e.g. nvidia.com/gpu: 2), while DRA uses claims — analogous to persistent volume claims — with structured parameters, so pods can request devices by attributes like memory size, MIG profile, or model, share devices, and get topology-aware allocation",
        "MIG partitioning is supported by the device plugin but fundamentally impossible under DRA",
      ],
      answerIndex: 2,
      explanation: "The device plugin's countable-integer model cannot express which GPU, what slice of it, or how it relates to other devices; DRA's claim-and-attribute model makes GPU allocation expressive and dynamic, which matters when inference pods need specific memory sizes, MIG slices, or interconnect topology.",
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
