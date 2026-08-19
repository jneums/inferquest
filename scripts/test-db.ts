/* DB-layer test: the exact operations the API routes perform. */
import { eq, and } from "drizzle-orm";
import { db, schema } from "../src/db";

async function main() {
  const d = db();
  const userId = "user_test123";

  // toggle on (idempotent)
  await d.insert(schema.taskCompletions).values({ userId, taskId: "fp-karpathy", xp: 40, date: "2026-08-19" }).onConflictDoNothing();
  await d.insert(schema.taskCompletions).values({ userId, taskId: "fp-karpathy", xp: 40, date: "2026-08-19" }).onConflictDoNothing();

  // verification receipt with jsonb evidence
  await d.insert(schema.verifications).values({
    userId, taskId: "oss-pr1", verifierType: "github-pr", passed: 1,
    submission: { prUrl: "https://github.com/vllm-project/vllm/pull/4332" },
    evidence: { checks: [{ name: "merged", passed: true, detail: "yes" }], title: "FP8 checkpoints" },
  });

  const completions = await d.select().from(schema.taskCompletions).where(eq(schema.taskCompletions.userId, userId));
  const receipts = await d.select().from(schema.verifications).where(and(eq(schema.verifications.userId, userId), eq(schema.verifications.taskId, "oss-pr1")));

  console.log("completions:", completions.length, "(expect 1 — conflict ignored)");
  console.log("receipt evidence roundtrip:", JSON.stringify((receipts[0].evidence as { title?: string }).title));

  // toggle off
  await d.delete(schema.taskCompletions).where(and(eq(schema.taskCompletions.userId, userId), eq(schema.taskCompletions.taskId, "fp-karpathy")));
  const after = await d.select().from(schema.taskCompletions).where(eq(schema.taskCompletions.userId, userId));
  console.log("after delete:", after.length, "(expect 0)");
  const ok = completions.length === 1 && after.length === 0 && (receipts[0].evidence as { title?: string }).title === "FP8 checkpoints";
  console.log(ok ? "DB TESTS PASSED" : "DB TESTS FAILED");
  process.exit(ok ? 0 : 1);
}
main();
