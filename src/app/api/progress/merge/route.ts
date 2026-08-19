import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db, schema } from "@/db";
import { TASKS_BY_ID } from "@/data/curriculum";

const mergeSchema = z.object({
  events: z
    .array(
      z.object({
        taskId: z.string(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      }),
    )
    .max(2000),
});

/**
 * One-time import of pre-signup localStorage progress. Verified tasks are
 * skipped — those must be earned through their verifier.
 */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const body = mergeSchema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const rows = body.data.events
    .map((e) => ({ e, task: TASKS_BY_ID.get(e.taskId) }))
    .filter(({ task }) => task && !task.verifier)
    .map(({ e, task }) => ({
      userId,
      taskId: e.taskId,
      xp: task!.xp,
      date: e.date,
    }));

  if (rows.length > 0) {
    await db().insert(schema.taskCompletions).values(rows).onConflictDoNothing();
  }
  return NextResponse.json({ imported: rows.length });
}
