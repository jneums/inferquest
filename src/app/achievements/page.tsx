"use client";

import { SignInButton } from "@clerk/nextjs";
import { ACHIEVEMENTS } from "@/data/achievements";
import { useProgress } from "@/lib/progress";
import { Card } from "@/components/ui";

export default function AchievementsPage() {
  const { ready, earnedAchievementIds, synced } = useProgress();

  if (!ready) return <div className="min-h-[50vh]" />;

  if (!synced) {
    return (
      <div className="mx-auto max-w-md pt-16 text-center">
        <div className="text-4xl" aria-hidden>🏆</div>
        <h1 className="mt-3 text-2xl font-semibold">Achievements</h1>
        <p className="mt-2 text-[var(--text-secondary)]">
          {ACHIEVEMENTS.length} badges — from your first task to verified
          merged PRs and 30-day review streaks. Sign in to start earning them.
        </p>
        <div className="mt-5">
          <SignInButton mode="modal">
            <button className="rounded-lg bg-[var(--accent)] px-5 py-2.5 font-medium text-white hover:bg-[var(--accent-strong)]">
              Sign in
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

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
        <p className="text-sm text-[var(--text-muted)]">
          Progress is saved to your account, including verification receipts
          (probe results, harness metrics, merged-PR evidence).
        </p>
      </section>
    </div>
  );
}
