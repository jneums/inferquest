import { NextResponse } from "next/server";
import { z } from "zod";
import { checkQuestionsFor, QUESTION_BANK } from "@/server/questionBank";

/**
 * Check-your-knowledge: formative, no gate, no persistence. GET serves the
 * questions (answers stripped); POST grades and returns explanations.
 * Deliberately public — anonymous learners get feedback too.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  const { taskId } = await params;
  const questions = checkQuestionsFor(taskId);
  if (!questions) return NextResponse.json({ error: "No check for this task" }, { status: 404 });
  return NextResponse.json({ questions });
}

const submitSchema = z.object({
  answers: z.array(z.object({ id: z.string(), choice: z.number() })).max(20),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  const { taskId } = await params;
  const body = submitSchema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const results = body.data.answers.map(({ id, choice }) => {
    const q = QUESTION_BANK.get(id);
    if (!q || !q.tasks.includes(taskId)) {
      return { id, correct: false, explanation: "Unknown question." };
    }
    return {
      id,
      correct: choice === q.answerIndex,
      correctChoice: q.choices[q.answerIndex],
      explanation: q.explanation,
    };
  });
  return NextResponse.json({
    results,
    score: results.filter((r) => r.correct).length,
    total: results.length,
  });
}
