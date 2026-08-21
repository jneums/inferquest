import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db, schema } from "@/db";
import { TASKS_BY_ID, QUEST_ID_BY_TASK, isQuestUnlockedFor } from "@/data/curriculum";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const rows = await db()
    .select({
      taskId: schema.taskCompletions.taskId,
      xp: schema.taskCompletions.xp,
      date: schema.taskCompletions.date,
      completedAt: schema.taskCompletions.completedAt,
    })
    .from(schema.taskCompletions)
    .where(eq(schema.taskCompletions.userId, userId));

  return NextResponse.json({
    events: rows.map((r) => ({
      taskId: r.taskId,
      xp: r.xp,
      date: r.date,
      at: r.completedAt.getTime(),
    })),
  });
}

const toggleSchema = z.object({
  taskId: z.string(),
  done: z.boolean(),
  /** Local date YYYY-MM-DD in the user's timezone (streaks are local-day). */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const body = toggleSchema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const { taskId, done, date } = body.data;

  const task = TASKS_BY_ID.get(taskId);
  if (!task) return NextResponse.json({ error: "Unknown task" }, { status: 404 });

  if (done && task.verifier) {
    return NextResponse.json(
      { error: "This task is verified — submit it through its verifier instead." },
      { status: 403 },
    );
  }

  if (done) {
    // Look-ahead is read-only: completing a task requires its quest unlocked.
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

  if (done) {
    await db()
      .insert(schema.taskCompletions)
      .values({ userId, taskId, xp: task.xp, date })
      .onConflictDoNothing();
  } else {
    await db()
      .delete(schema.taskCompletions)
      .where(
        and(
          eq(schema.taskCompletions.userId, userId),
          eq(schema.taskCompletions.taskId, taskId),
        ),
      );
  }
  return NextResponse.json({ ok: true });
}
