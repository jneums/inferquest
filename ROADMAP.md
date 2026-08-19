# Roadmap → InferQuest

The original prose roadmap grew into the app itself: the complete, researched
curriculum now lives in [`src/data/curriculum.ts`](src/data/curriculum.ts) —
10 phases from performance mental models through GPU kernels, engine
internals, quantization, production serving, distributed inference, and
economics, ending in verified open-source contributions and the job hunt.

The path, in one breath:

**Bedrock** (Horace He's mental models, PyTorch internals) →
**Transformer Internals** (build GPT from scratch; MQA/GQA/MLA, RoPE, MoE) →
**The Inference Engine** (KV cache grader, Orca/PagedAttention/Sarathi, spec
decoding, build-your-own-engine capstone probed live for OpenAI conformance) →
**GPU Architecture & CUDA** (PMPP, GPU MODE, matmul at ≥40% of cuBLAS,
Nsight, rooflines) →
**Kernel Engineering** (Triton, FlashAttention lineage, graded flash-attention
kernel, GPU MODE leaderboard) →
**Quantization** (GPTQ/AWQ/FP8/NVFP4, llm-compressor + lm-eval with published
results) →
**Production Serving** (vLLM V1 + SGLang on the Portal Labs fleet, verified
conformance + latency probes, published benchmarks) →
**Distributed** (TP/PP/EP, DistServe/Mooncake, Dynamo/llm-d/K8s) →
**Observability & Economics** (SLOs, goodput, cost-per-token model) →
**The Arena** (3 verified merged PRs, interview gauntlet, offer).

Research provenance: 2025–26 job postings and interview guides across the
major inference shops, the GPU MODE/PMPP/CS336 curricula, and vLLM/SGLang
source-level API-conformance analysis.
