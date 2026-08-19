# script-name -> (website task id, grader module)
# Keep task ids in sync with src/data/curriculum.ts.
SCRIPTS = {
    "attention-pytorch": ("fp-attn-harness", "attention_pytorch"),
    "cached-decoder": ("kv-harness", "cached_decoder"),
    "softmax-triton": ("triton-softmax-harness", "softmax_triton"),
    "matmul-tiled": ("cuda-matmul-harness", "matmul_tiled"),
    "flash-attention-triton": ("triton-flash-harness", "flash_attention_triton"),
}
