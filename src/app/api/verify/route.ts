import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { TASKS_BY_ID, QUEST_ID_BY_TASK, isQuestUnlockedFor } from "@/data/curriculum";
import { verifyGithubPr } from "@/server/verifiers/githubPr";
import { verifyUrl } from "@/server/verifiers/urlCheck";
import { verifyHarnessReport } from "@/server/verifiers/harness";
import { verifyLatency, verifyOpenAICompat } from "@/server/verifiers/openaiCompat";
import { gradeQuiz } from "@/server/quizBank";
import type { CheckResult } from "@/server/verifiers/net";

/** Endpoint probes stream real completions; give them room. */
export const maxDuration = 60;

const submissionSchema = z.object({
  taskId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  submission: z.unknown(),
});

const endpointSubmission = z.object({
  url: z.string().max(2000),
  apiKey: z.string().max(500).optional(),
  model: z.string().max(200).optional(),
});
const prSubmission = z.object({ prUrl: z.string().max(500) });
const urlSubmission = z.object({ url: z.string().max(2000) });
const quizSubmission = z.object({ answers: z.array(z.number()).max(50) });

interface Outcome {
  passed: boolean;
  checks: CheckResult[];
  evidence: Record<string, unknown>;
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const body = submissionSchema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const { taskId, date, submission } = body.data;

  const task = TASKS_BY_ID.get(taskId);
  if (!task) return NextResponse.json({ error: "Unknown task" }, { status: 404 });
  const verifier = task.verifier;
  if (!verifier) {
    return NextResponse.json({ error: "This task has no verifier" }, { status: 400 });
  }

  // Look-ahead is read-only: verifying requires the task's quest unlocked.
  {
    const rows = await db()
      .select({ taskId: schema.taskCompletions.taskId })
      .from(schema.taskCompletions)
      .where(eq(schema.taskCompletions.userId, userId));
    const doneSet = new Set(rows.map((r) => r.taskId));
    const questId = QUEST_ID_BY_TASK.get(taskId);
    if (!questId || !isQuestUnlockedFor(doneSet, questId)) {
      return NextResponse.json(
        { error: "This quest is still locked — finish its prerequisites first." },
        { status: 403 },
      );
    }
  }

  let result: Outcome;
  let storedSubmission: unknown = submission;

  try {
    switch (verifier.type) {
      case "endpoint": {
        const s = endpointSubmission.parse(submission);
        // Never persist API keys — they're used for the probe and dropped.
        storedSubmission = { url: s.url, model: s.model };
        result =
          verifier.suite === "openai-compat"
            ? await verifyOpenAICompat(s.url, s.apiKey, s.model)
            : await verifyLatency(s.url, verifier.thresholds ?? {}, s.apiKey, s.model);
        break;
      }
      case "github-pr": {
        const s = prSubmission.parse(submission);
        result = await verifyGithubPr(s.prUrl, verifier.repoAllowlist);
        break;
      }
      case "url": {
        const s = urlSubmission.parse(submission);
        result = await verifyUrl(s.url, {
          mustContainAny: verifier.mustContainAny,
          minWords: verifier.minWords,
        });
        break;
      }
      case "harness": {
        result = verifyHarnessReport(submission, taskId, verifier.metrics);
        break;
      }
      case "quiz": {
        const s = quizSubmission.parse(submission);
        result = gradeQuiz(verifier.quizId, s.answers, verifier.passPct);
        break;
      }
    }
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Malformed submission" }, { status: 400 });
    }
    throw e;
  }

  await db().insert(schema.verifications).values({
    userId,
    taskId,
    verifierType: verifier.type,
    passed: result.passed ? 1 : 0,
    submission: storedSubmission as object,
    evidence: { checks: result.checks, ...result.evidence } as object,
  });

  if (result.passed) {
    await db()
      .insert(schema.taskCompletions)
      .values({ userId, taskId, xp: task.xp, date })
      .onConflictDoNothing();
  }

  return NextResponse.json({
    passed: result.passed,
    checks: result.checks,
    evidence: result.evidence,
  });
}
