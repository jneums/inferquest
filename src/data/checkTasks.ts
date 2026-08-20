/**
 * Task ids that have inline "check your knowledge" questions.
 * Client-safe mirror of the server question bank's coverage — kept honest by
 * scripts/audit-curriculum.ts, which fails if this drifts from
 * src/server/questionBank.ts.
 */
export const CHECK_TASK_IDS = new Set([
  "mm-brrr",
  "mm-glossary",
  "pt-ezyang",
  "fp-tokenizer",
  "fp-sampling",
  "zoo-mqa",
  "zoo-rope",
  "batch-paged",
  "cuda-pmpp-1",
  "matmul-boehm",
  "fa-papers",
  "quant-visual",
  "vllm-anatomy",
  "econ-first-principles",
]);
