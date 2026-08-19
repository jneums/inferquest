# Inference Engineer Roadmap

Goal: land an inference engineering role, leveraging 10+ years SWE + hands-on GPU fleet experience at Portal Labs.

## Phase 1 — Transformer internals, from the serving side (4–6 weeks)
The job is making inference fast and cheap, so learn the architecture through that lens.

- [ ] Implement GPT-2 inference from scratch (start from Karpathy's nanoGPT or llm.c; write the forward pass yourself)
- [ ] Add a KV cache to it; measure the speedup and understand exactly why decode is memory-bandwidth-bound
- [ ] Add naive batching, then continuous batching; internalize the prefill vs. decode distinction
- [ ] Papers: Attention Is All You Need → FlashAttention (1 & 2) → PagedAttention (vLLM) → Orca (continuous batching) → speculative decoding (Leviathan et al.)
- Deliverable: a "toy inference server" repo with benchmark numbers at each optimization step

## Phase 2 — GPU programming and profiling (6–8 weeks, overlaps Phase 1)
- [ ] Work through *Programming Massively Parallel Processors* (PMPP) core chapters
- [ ] GPU MODE (formerly CUDA MODE) lecture series + Discord
- [ ] Learn the memory hierarchy cold: registers → shared memory/SRAM → L2 → HBM; roofline model; arithmetic intensity
- [ ] Write 3–5 kernels in CUDA and Triton: vector add → tiled matmul → softmax → fused attention (simplified)
- [ ] Profile everything: Nsight Systems, Nsight Compute, torch profiler; learn to read flame graphs and kernel timelines
- Deliverable: a kernels repo with profiler screenshots and "why it's fast/slow" writeups

## Phase 3 — Framework depth on the Portal Labs fleet (ongoing, start ~week 4)
This is the unfair advantage: real hardware, real workloads.

- [ ] Deploy vLLM AND SGLang on the fleet; benchmark them head-to-head on a real workload (TTFT, ITL, throughput, cost/1M tokens)
- [ ] Tune: tensor parallel sizes, max batched tokens, prefix caching, chunked prefill, quantization (AWQ/GPTQ/FP8)
- [ ] Read vLLM source: scheduler, block manager, model runner. Trace one request end-to-end.
- [ ] Try TensorRT-LLM on one model for the NVIDIA-stack perspective
- [ ] Learn distributed inference concepts: tensor/pipeline/expert parallelism, disaggregated prefill
- Deliverable: public benchmark blog posts with real numbers from the fleet

## Phase 4 — Public proof of work (start ~month 3, continuous)
- [ ] 2–3 merged PRs to vLLM or SGLang (start with good-first-issue, aim for a perf or correctness fix)
- [ ] 3+ technical blog posts (benchmarks, a kernel deep-dive, a "how we cut cost/token at Portal Labs" story)
- [ ] Rewrite resume around inference: fleet ops, cost-per-token wins, OSS contributions

## Target roles (in rough order of fit)
1. Inference providers: Together AI, Fireworks, Baseten, Modal, Anyscale — serving infra + perf, values production maturity
2. GPU clouds / neoclouds: CoreWeave, Lambda, etc.
3. Product companies serving their own models
4. NVIDIA-style kernel/perf roles — only after Phase 2 goes deep; hardest bar on CUDA

## Skills checklist (from Aug 2026 job postings)
- Inference frameworks: vLLM, SGLang, TensorRT-LLM, Triton Inference Server
- Techniques: continuous batching, KV cache management, paged attention, speculative decoding, quantization, prefix caching
- GPU: CUDA and/or Triton, memory hierarchy, profiling (Nsight, microbenchmarks)
- Distributed: tensor/pipeline/MoE parallelism
- Systems: Python + C++ (or Go), Linux, containers/K8s ✓ (already have)
- Production ops, SLAs, cost optimization ✓ (already have via Portal Labs)
