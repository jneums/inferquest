# script-name -> (website task id, grader module)
# Keep task ids in sync with src/data/curriculum.ts.
SCRIPTS = {
    "attention-pytorch": ("fp-attn-harness", "attention_pytorch"),
    "cached-decoder": ("kv-harness", "cached_decoder"),
    "speculative-decoding": ("spec-harness", "speculative_decoding"),
    "softmax-triton": ("triton-softmax-harness", "softmax_triton"),
    "matmul-tiled": ("cuda-matmul-harness", "matmul_tiled"),
    "flash-attention-triton": ("triton-flash-harness", "flash_attention_triton"),
    "weight-quantizer": ("quant-scratch-harness", "weight_quantizer"),
    "ring-allreduce": ("par-allreduce-harness", "ring_allreduce"),
    "first-convergence": ("bp-first-convergence", "first_convergence"),
    "train-speedup": ("fast-m3", "train_speedup"),
}
