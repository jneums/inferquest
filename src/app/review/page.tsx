"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { SignInButton } from "@clerk/nextjs";
import { useProgress } from "@/lib/progress";
import { Card } from "@/components/ui";
import { IconCycle, IconSun } from "@/components/icons";

interface ReviewCard {
  id: string;
  prompt: string;
  choices: string[];
}

interface CardResult {
  id: string;
  correct: boolean;
  correctChoice?: string;
  explanation: string;
  nextInDays: number;
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function ReviewPage() {
  const { ready, synced } = useProgress();
  const [cards, setCards] = useState<ReviewCard[] | null>(null);
  const [deckSize, setDeckSize] = useState(0);
  const [nextDueAt, setNextDueAt] = useState<number | null>(null);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<CardResult | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [finished, setFinished] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/review");
    if (!res.ok) return;
    const data = await res.json();
    setCards(data.cards);
    setDeckSize(data.deckSize);
    setNextDueAt(data.nextDueAt);
    setIdx(0);
    setPicked(null);
    setFeedback(null);
    setCorrectCount(0);
    setXpEarned(0);
    setFinished(false);
  }, []);

  useEffect(() => {
    if (!synced) return;
    let cancelled = false;
    (async () => {
      // All state updates happen after the fetch resolves, never synchronously.
      if (!cancelled) await load();
    })();
    return () => {
      cancelled = true;
    };
  }, [synced, load]);

  if (!ready) return <div className="min-h-[50vh]" />;

  if (!synced) {
    return (
      <div className="mx-auto max-w-md pt-16 text-center">
        <IconCycle size={36} className="mx-auto text-[var(--accent-strong)]" aria-hidden />
        <h1 className="mt-3 text-2xl font-semibold">Spaced review</h1>
        <p className="mt-2 text-[var(--text-secondary)]">
          Questions from tasks you&rsquo;ve completed come back on an expanding
          schedule — a few minutes a day keeps last week&rsquo;s learning from
          evaporating. Reviews earn XP and keep your streak alive.
        </p>
        <div className="mt-5">
          <SignInButton mode="modal">
            <button className="bg-[var(--ink)] px-5 py-2.5 font-bold text-[var(--on-ink)] hover:bg-black">
              Sign in to start reviewing
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  if (cards === null) {
    return <p className="pt-8 text-center text-[var(--text-muted)]">Loading your deck…</p>;
  }

  if (finished) {
    return (
      <div className="mx-auto max-w-xl space-y-4 pt-8">
        <h1 className="text-3xl font-semibold tracking-tight">Review complete</h1>
        <Card className="px-5 py-4">
          <p className="text-lg">
            {correctCount}/{cards.length} correct
            {xpEarned > 0 && (
              <span className="ml-2 bg-[var(--accent-track)] px-2 py-0.5 font-mono text-sm font-medium text-[var(--accent-strong)]">
                +{xpEarned} XP
              </span>
            )}
          </p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Correct cards moved further out; missed ones come back tomorrow.
          </p>
        </Card>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--accent)]"
          >
            Check for more
          </button>
          <Link
            href="/"
            className="border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--accent)]"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="mx-auto max-w-md pt-16 text-center">
        <IconSun size={36} className="mx-auto text-[var(--accent-strong)]" aria-hidden />
        <h1 className="mt-3 text-2xl font-semibold">Nothing due</h1>
        <p className="mt-2 text-[var(--text-secondary)]">
          {deckSize === 0
            ? "Your deck is empty — complete tasks with drills or knowledge checks and their questions start cycling here."
            : `All ${deckSize} cards are scheduled ahead.${nextDueAt ? ` Next review ${new Date(nextDueAt).toLocaleDateString()}.` : ""}`}
        </p>
        <Link
          href="/quests"
          className="mt-4 inline-block text-sm text-[var(--accent-strong)] underline underline-offset-2"
        >
          Go earn more cards →
        </Link>
      </div>
    );
  }

  const card = cards[idx];
  const isLast = idx === cards.length - 1;

  const grade = async () => {
    if (picked === null) return;
    setBusy(true);
    const res = await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: todayKey(),
        answers: [{ id: card.id, choice: picked }],
      }),
    });
    if (res.ok) {
      const data = await res.json();
      const result: CardResult | undefined = data.results?.[0];
      if (result) {
        setFeedback(result);
        if (result.correct) setCorrectCount((c) => c + 1);
      }
      if (data.xpAwarded) setXpEarned((x) => x + data.xpAwarded);
    }
    setBusy(false);
  };

  return (
    <div className="mx-auto max-w-xl space-y-4 pt-4">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Review</h1>
        <span className="text-sm text-[var(--text-muted)]">
          {idx + 1} / {cards.length}
        </span>
      </div>
      <Card className="px-5 py-4">
        <p className="font-medium">{card.prompt}</p>
        <div className="mt-3 space-y-1.5">
          {card.choices.map((choice, ci) => (
            <label key={ci} className="flex items-start gap-2 text-sm">
              <input
                type="radio"
                name={`review-${card.id}`}
                checked={picked === ci}
                onChange={() => setPicked(ci)}
                disabled={feedback !== null}
                className="mt-1 accent-[var(--accent)]"
              />
              <span className="text-[var(--text-secondary)]">{choice}</span>
            </label>
          ))}
        </div>
        {feedback && (
          <p className={`mt-3 text-sm font-medium ${feedback.correct ? "text-[var(--good-text)]" : "text-[var(--amber)]"}`}>
            {feedback.correct
              ? `PASS — next review in ${feedback.nextInDays}d`
              : `FAIL — answer: ${feedback.correctChoice} — back tomorrow`}{" "}
            <span className="text-[var(--text-secondary)]">— {feedback.explanation}</span>
          </p>
        )}
      </Card>
      {feedback === null ? (
        <button
          disabled={picked === null || busy}
          onClick={grade}
          className="bg-[var(--ink)] px-4 py-2 text-sm font-bold text-[var(--on-ink)] hover:bg-black disabled:opacity-50"
        >
          {busy ? "Grading…" : "Check"}
        </button>
      ) : (
        <button
          onClick={() => {
            if (isLast) {
              setFinished(true);
            } else {
              setIdx(idx + 1);
              setPicked(null);
              setFeedback(null);
            }
          }}
          className="bg-[var(--ink)] px-4 py-2 text-sm font-bold text-[var(--on-ink)] hover:bg-black"
        >
          {isLast ? "Finish session" : "Next card"}
        </button>
      )}
    </div>
  );
}
