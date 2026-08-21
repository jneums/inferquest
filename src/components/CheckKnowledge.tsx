"use client";

import { useEffect, useState } from "react";
import { IconQuiz } from "@/components/icons";

interface CheckQ {
  id: string;
  prompt: string;
  choices: string[];
}

interface Result {
  id: string;
  correct: boolean;
  correctChoice?: string;
  explanation: string;
}

/**
 * Formative, ungated "check your knowledge" for reading/watching tasks.
 * Works signed-out; once the task is completed these same questions enter
 * the spaced-repetition deck.
 */
export function CheckKnowledge({ taskId }: { taskId: string }) {
  const [open, setOpen] = useState(false);
  const [questions, setQuestions] = useState<CheckQ[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [results, setResults] = useState<Result[] | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open || questions) return;
    let cancelled = false;
    fetch(`/api/check/${taskId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d) setQuestions(d.questions);
      });
    return () => {
      cancelled = true;
    };
  }, [open, questions, taskId]);

  const resultFor = (id: string) => results?.find((r) => r.id === id);

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 border border-[var(--border)] px-2 py-0.5 text-[11px] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
      >
        {open ? "hide check" : (<><IconQuiz size={11} /> check your knowledge</>)}
      </button>

      {open && (
        <div className="mt-3 border border-[var(--hairline)] bg-[var(--page)] p-3">
          {!questions ? (
            <p className="text-sm text-[var(--text-muted)]">Loading…</p>
          ) : (
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                const res = await fetch(`/api/check/${taskId}`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    answers: questions.map((q) => ({ id: q.id, choice: answers[q.id] ?? -1 })),
                  }),
                });
                if (res.ok) setResults((await res.json()).results);
                setBusy(false);
              }}
            >
              <p className="text-xs text-[var(--text-muted)]">
                Ungraded — instant feedback. These questions join your review
                deck once you complete the task.
              </p>
              {questions.map((q, qi) => {
                const r = resultFor(q.id);
                return (
                  <fieldset key={q.id} className="space-y-1.5">
                    <legend className="text-sm font-medium">
                      {qi + 1}. {q.prompt}
                    </legend>
                    {q.choices.map((choice, ci) => (
                      <label key={ci} className="flex items-start gap-2 text-sm">
                        <input
                          type="radio"
                          name={`check-${taskId}-${q.id}`}
                          checked={answers[q.id] === ci}
                          onChange={() => setAnswers((a) => ({ ...a, [q.id]: ci }))}
                          disabled={results !== null}
                          required
                          className="mt-1 accent-[var(--accent)]"
                        />
                        <span className="text-[var(--text-secondary)]">{choice}</span>
                      </label>
                    ))}
                    {r && (
                      <p className={`text-sm font-medium ${r.correct ? "text-[var(--good-text)]" : "text-[var(--amber)]"}`}>
                        {r.correct ? "PASS — correct" : `FAIL — answer: ${r.correctChoice}`}{" "}
                        <span className="text-[var(--text-secondary)]">— {r.explanation}</span>
                      </p>
                    )}
                  </fieldset>
                );
              })}
              {results === null ? (
                <button
                  type="submit"
                  disabled={busy}
                  className="bg-[var(--accent)] px-3 py-1.5 text-sm font-bold text-[var(--on-accent)] hover:bg-[var(--accent-strong)] disabled:opacity-50"
                >
                  {busy ? "Checking…" : "Check answers"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setResults(null);
                    setAnswers({});
                  }}
                  className="border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--accent)]"
                >
                  Try again
                </button>
              )}
            </form>
          )}
        </div>
      )}
    </div>
  );
}
