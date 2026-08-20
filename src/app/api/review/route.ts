import { auth } from "@clerk/nextjs/server";
import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db, schema } from "@/db";
import { QUESTION_BANK, unlockedQuestions } from "@/server/questionBank";
import { NEW_CARD, schedule } from "@/server/reviewScheduler";

export const REVIEW_DAY_XP = 25;

const SESSION_LIMIT = 20;

async function deckFor(userId: string) {
  const completions = await db()
    .select({ taskId: schema.taskCompletions.taskId })
    .from(schema.taskCompletions)
    .where(eq(schema.taskCompletions.userId, userId));
  const done = new Set(completions.map((c) => c.taskId));
  const deck = unlockedQuestions(done);
  const states = deck.length
    ? await db()
        .select()
        .from(schema.reviewStates)
        .where(
          and(
            eq(schema.reviewStates.userId, userId),
            inArray(
              schema.reviewStates.questionId,
              deck.map((q) => q.id),
            ),
          ),
        )
    : [];
  const stateById = new Map(states.map((s) => [s.questionId, s]));
  return { deck, stateById };
}

/** Due cards for this user (answers stripped), plus deck stats. */
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const { deck, stateById } = await deckFor(userId);
  const now = Date.now();
  const due = deck.filter((q) => {
    const s = stateById.get(q.id);
    return !s || s.due.getTime() <= now;
  });
  // Lapsed/oldest first so struggling cards get priority.
  due.sort((a, b) => {
    const sa = stateById.get(a.id);
    const sb = stateById.get(b.id);
    return (sa?.due.getTime() ?? 0) - (sb?.due.getTime() ?? 0);
  });

  const nextDue = deck
    .map((q) => stateById.get(q.id)?.due.getTime())
    .filter((t): t is number => t !== undefined && t > now)
    .sort((a, b) => a - b)[0];

  return NextResponse.json({
    cards: due.slice(0, SESSION_LIMIT).map((q) => ({
      id: q.id,
      prompt: q.prompt,
      choices: q.choices,
    })),
    dueCount: due.length,
    deckSize: deck.length,
    nextDueAt: nextDue ?? null,
  });
}

const submitSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  answers: z.array(z.object({ id: z.string(), choice: z.number() })).min(1).max(SESSION_LIMIT),
});

/** Grade a review session, advance scheduling, award the daily review XP. */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const body = submitSchema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const { deck, stateById } = await deckFor(userId);
  const inDeck = new Set(deck.map((q) => q.id));

  const results = [];
  for (const { id, choice } of body.data.answers) {
    const q = QUESTION_BANK.get(id);
    if (!q || !inDeck.has(id)) continue;
    const correct = choice === q.answerIndex;
    const prev = stateById.get(id) ?? { ...NEW_CARD, questionId: id };
    const next = schedule(
      { intervalDays: prev.intervalDays, ease: prev.ease, reps: prev.reps, lapses: prev.lapses },
      correct,
    );
    const due = new Date(Date.now() + next.dueInDays * 24 * 3600 * 1000);
    await db()
      .insert(schema.reviewStates)
      .values({
        userId,
        questionId: id,
        due,
        intervalDays: next.intervalDays,
        ease: next.ease,
        reps: next.reps,
        lapses: next.lapses,
      })
      .onConflictDoUpdate({
        target: [schema.reviewStates.userId, schema.reviewStates.questionId],
        set: {
          due,
          intervalDays: next.intervalDays,
          ease: next.ease,
          reps: next.reps,
          lapses: next.lapses,
          updatedAt: new Date(),
        },
      });
    results.push({
      id,
      correct,
      correctChoice: q.choices[q.answerIndex],
      explanation: q.explanation,
      nextInDays: next.dueInDays,
    });
  }

  if (results.length === 0) {
    return NextResponse.json({ error: "No valid answers" }, { status: 400 });
  }

  // One daily-review completion per local day; feeds XP, streaks, heatmap.
  const reviewTaskId = `review-${body.data.date}`;
  const inserted = await db()
    .insert(schema.taskCompletions)
    .values({ userId, taskId: reviewTaskId, xp: REVIEW_DAY_XP, date: body.data.date })
    .onConflictDoNothing()
    .returning({ taskId: schema.taskCompletions.taskId });

  return NextResponse.json({
    results,
    score: results.filter((r) => r.correct).length,
    total: results.length,
    xpAwarded: inserted.length > 0 ? REVIEW_DAY_XP : 0,
  });
}
