import { z } from "zod";
import type { CheckResult } from "./net";

/**
 * Report emitted by `harness/run.py`. The harness runs the task's checks on
 * the user's own GPU (correctness vs a reference implementation, measured
 * performance) and prints this JSON for the user to paste in.
 *
 * Honesty model: like fitness apps and typing tests, the measurement happens
 * client-side because that's where the GPU is; the server validates shape,
 * internal consistency, and thresholds. The report includes the raw
 * per-check output so a public profile can display receipts.
 */
export const harnessReportSchema = z.object({
  harness_version: z.string(),
  task_id: z.string(),
  passed: z.boolean(),
  env: z.object({
    gpu: z.string().min(1),
    driver: z.string().optional(),
    torch: z.string().optional(),
    cuda: z.string().optional(),
    python: z.string().optional(),
  }),
  checks: z
    .array(
      z.object({
        name: z.string(),
        passed: z.boolean(),
        detail: z.string(),
      }),
    )
    .min(1),
  metrics: z.record(z.string(), z.number()),
  duration_s: z.number().nonnegative(),
});

export type HarnessReport = z.infer<typeof harnessReportSchema>;

export interface HarnessResult {
  passed: boolean;
  checks: CheckResult[];
  evidence: Record<string, unknown>;
}

export function verifyHarnessReport(
  raw: unknown,
  taskId: string,
  requirements: Record<string, { op: ">=" | "<="; value: number }>,
): HarnessResult {
  const parsed = harnessReportSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      passed: false,
      checks: [
        {
          name: "report-format",
          passed: false,
          detail: `Not a valid harness report: ${parsed.error.issues[0]?.message ?? "parse error"} at ${parsed.error.issues[0]?.path.join(".")}`,
        },
      ],
      evidence: {},
    };
  }
  const report = parsed.data;
  const checks: CheckResult[] = [];

  checks.push({
    name: "task-match",
    passed: report.task_id === taskId,
    detail:
      report.task_id === taskId
        ? `Report is for ${taskId}`
        : `Report is for "${report.task_id}", not this task`,
  });
  const allChecksPassed = report.checks.every((c) => c.passed);
  checks.push({
    name: "harness-checks",
    passed: report.passed && allChecksPassed,
    detail:
      report.passed && allChecksPassed
        ? `All ${report.checks.length} harness checks passed on ${report.env.gpu}`
        : `Failed: ${report.checks.filter((c) => !c.passed).map((c) => c.name).join(", ") || "report marked failed"}`,
  });

  for (const [metric, req] of Object.entries(requirements)) {
    const actual = report.metrics[metric];
    const present = typeof actual === "number" && Number.isFinite(actual);
    const ok = present && (req.op === ">=" ? actual >= req.value : actual <= req.value);
    checks.push({
      name: `metric:${metric}`,
      passed: ok,
      detail: present
        ? `${metric} = ${actual} (must be ${req.op} ${req.value})`
        : `Report is missing metric "${metric}"`,
    });
  }

  return {
    passed: checks.every((c) => c.passed),
    checks,
    evidence: {
      gpu: report.env.gpu,
      torch: report.env.torch,
      cuda: report.env.cuda,
      metrics: report.metrics,
      harnessChecks: report.checks,
      durationS: report.duration_s,
    },
  };
}
