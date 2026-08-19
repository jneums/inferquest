"use client";

import { SignInButton } from "@clerk/nextjs";
import { ACHIEVEMENTS } from "@/data/achievements";
import { useProgress } from "@/lib/progress";
import { Card } from "@/components/ui";

export default function AchievementsPage() {
  const { earnedAchievementIds, synced, resetAll } = useProgress();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Achievements</h1>
        <p className="mt-1 text-[var(--text-secondary)]">
          {earnedAchievementIds.size} of {ACHIEVEMENTS.length} earned.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {ACHIEVEMENTS.map((a) => {
          const earned = earnedAchievementIds.has(a.id);
          return (
            <Card
              key={a.id}
              className={`flex items-center gap-3 px-4 py-3 ${
                earned ? "" : "opacity-50 grayscale"
              }`}
            >
              <span className="text-3xl" aria-hidden>
                {a.emoji}
              </span>
              <div>
                <div className="font-medium">
                  {a.title}
                  {earned && (
                    <span className="ml-2 text-xs font-normal text-[var(--good-text)]">
                      earned
                    </span>
                  )}
                </div>
                <div className="text-sm text-[var(--text-secondary)]">
                  {a.description}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <section className="space-y-2 border-t border-[var(--hairline)] pt-6">
        <h2 className="text-sm font-medium text-[var(--text-secondary)]">
          Your data
        </h2>
        {synced ? (
          <p className="text-sm text-[var(--text-muted)]">
            Progress is saved to your account, including verification receipts
            (probe results, harness metrics, merged-PR evidence).
          </p>
        ) : (
          <div className="text-sm text-[var(--text-muted)]">
            <p>
              You&apos;re browsing anonymously — progress lives only in this
              browser.{" "}
              <SignInButton mode="modal">
                <button className="font-medium text-[var(--accent-strong)] underline underline-offset-2">
                  Sign in
                </button>
              </SignInButton>{" "}
              to save it to an account (your local progress is imported
              automatically) and to unlock verified tasks.
            </p>
            <button
              onClick={() => {
                if (confirm("Reset local progress? This cannot be undone."))
                  resetAll();
              }}
              className="mt-2 rounded-md border border-[var(--border)] px-3 py-1.5 text-[var(--text-muted)] hover:border-[var(--baseline)]"
            >
              Reset local progress
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
