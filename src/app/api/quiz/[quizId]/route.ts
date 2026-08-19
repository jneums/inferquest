import { NextResponse } from "next/server";
import { publicQuiz } from "@/server/quizBank";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ quizId: string }> },
) {
  const { quizId } = await params;
  const quiz = publicQuiz(quizId);
  if (!quiz) return NextResponse.json({ error: "Unknown quiz" }, { status: 404 });
  return NextResponse.json(quiz);
}
