"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PHASES, QUESTS, TOTAL_XP } from "@/data/curriculum";
import { ACHIEVEMENTS } from "@/data/achievements";
import { levelForXP, nextLevel } from "@/lib/levels";
import { useProgress } from "@/lib/progress";
import { Heatmap } from "@/components/Heatmap";
import { IconCycle } from "@/components/icons";
import { Card, Meter, StatTile } from "@/components/ui";

export function Dashboard() {
  const {
    ready,
    xp,
    streak,
    longestStreak,
    doneTaskIds,
    xpByDay,
    earnedAchievementIds,
    isQuestUnlocked,
    questCompletion,
  } = useProgress();

  const level = levelForXP(xp);
  const next = nextLevel(xp);
  const totalTasks = QUESTS.reduce((s, q) => s + q.tasks.length, 0);

  const [reviewsDue, setReviewsDue] = useState<number | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/review")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d) setReviewsDue(d.dueCount);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const upNext = QUESTS.find((q) => {
    const { done, total } = questCompletion(q.id);
    return isQuestUnlocked(q.id) && done < total;
  });
  const nextTask = upNext?.tasks.find((t) => !doneTaskIds.has(t.id));

  return (
    <div className="space-y-12 sm:space-y-14">
      {/* Hero: current level + XP toward the next */}
      <section className="pt-2">
        <div className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent-strong)]">
          Level {level.n}
        </div>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight">{level.title}</h1>
        <div className="mt-6 max-w-xl">
          <Meter
            value={xp - level.minXP}
            max={(next?.minXP ?? xp) - level.minXP || 1}
          />
          <div className="mt-2 text-sm text-[var(--text-secondary)]">
            {next
              ? `${xp.toLocaleString()} XP — ${(next.minXP - xp).toLocaleString()} to Level ${next.n}: ${next.title}`
              : `${xp.toLocaleString()} XP — max level reached. Go get paid.`}
          </div>
        </div>
      </section>

      {/* Stat tiles */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile
          label="Total XP"
          value={ready ? xp.toLocaleString() : "—"}
          sub={`of ${TOTAL_XP.toLocaleString()} available`}
        />
        <StatTile
          label="Current streak"
          value={ready ? `${streak}d` : "—"}
          sub={`longest ${longestStreak}d`}
        />
        <StatTile
          label="Tasks done"
          value={ready ? String(doneTaskIds.size) : "—"}
          sub={`of ${totalTasks}`}
        />
        <StatTile
          label="Badges"
          value={ready ? String(earnedAchievementIds.size) : "—"}
          sub={`of ${ACHIEVEMENTS.length}`}
        />
      </section>

      {/* Spaced review */}
      {reviewsDue !== null && reviewsDue > 0 && (
        <section>
          <Link href="/review" className="block">
            <Card className="flex items-center gap-3 border-[var(--accent)] px-4 py-3 transition-colors hover:border-[var(--accent-strong)]">
              <IconCycle size={18} className="shrink-0 text-[var(--accent-strong)]" aria-hidden />
              <div>
                <div className="font-medium">
                  {reviewsDue} review card{reviewsDue === 1 ? "" : "s"} due
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  A few minutes now keeps last week loaded — and feeds the streak.
                </div>
              </div>
              <span className="ml-auto text-sm font-medium text-[var(--accent-strong)]">Review →</span>
            </Card>
          </Link>
        </section>
      )}

      {/* Up next */}
      {upNext && nextTask && (
        <section className="border-t-[3px] border-[var(--ink)] pt-5">
          <h2 className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
            Up next
          </h2>
          <Link href={`/quests/${upNext.id}`} className="block">
            <Card className="px-4 py-3 transition-colors hover:border-[var(--accent)]">
              <div className="text-xs text-[var(--text-muted)]">
                {upNext.title}
              </div>
              <div className="mt-0.5 font-medium">
                {nextTask.title}{" "}
                <span className="text-sm font-normal text-[var(--text-muted)]">
                  · +{nextTask.xp} XP
                </span>
              </div>
            </Card>
          </Link>
        </section>
      )}

      {/* Activity heatmap */}
      <section className="border-t-[3px] border-[var(--ink)] pt-5">
        <h2 className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Activity — XP per day, last year
        </h2>
        <Card className="px-4 py-4">
          <Heatmap xpByDay={xpByDay} />
        </Card>
      </section>

      {/* Phase progress: Foundations trunk, then each path's own phases */}
      <section className="border-t-[3px] border-[var(--ink)] pt-5">
        <h2 className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Phases — Foundations
        </h2>
        <div className="space-y-3">
          {PHASES.filter(
            (p) =>
              !p.pathId &&
              QUESTS.filter((q) => q.phaseId === p.id).every(
                (q) => (q.paths ?? ["inference"]).length > 1,
              ),
          ).map((phase) => {
            const quests = QUESTS.filter((q) => q.phaseId === phase.id);
            const total = quests.reduce((s, q) => s + q.tasks.length, 0);
            const done = quests.reduce(
              (s, q) => s + q.tasks.filter((t) => doneTaskIds.has(t.id)).length,
              0,
            );
            return (
              <Link key={phase.id} href="/quests" className="block">
                <Card className="px-4 py-3 transition-colors hover:border-[var(--accent)]">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium">
                      {phase.number}. {phase.title}
                    </div>
                    <span className="text-xs text-[var(--text-muted)]">
                      {done}/{total}
                    </span>
                  </div>
                  <Meter value={done} max={total} className="mt-2" />
                </Card>
              </Link>
            );
          })}
        </div>
        <h2 className="mb-4 mt-8 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Phases — Inference Engineering
        </h2>
        <div className="space-y-3">
          {PHASES.filter(
            (p) =>
              !p.pathId &&
              QUESTS.filter((q) => q.phaseId === p.id).some(
                (q) => (q.paths ?? ["inference"]).length === 1,
              ),
          ).map((phase) => {
            const quests = QUESTS.filter((q) => q.phaseId === phase.id);
            const total = quests.reduce((s, q) => s + q.tasks.length, 0);
            const done = quests.reduce(
              (s, q) => s + q.tasks.filter((t) => doneTaskIds.has(t.id)).length,
              0,
            );
            return (
              <Link key={phase.id} href="/quests" className="block">
                <Card className="px-4 py-3 transition-colors hover:border-[var(--accent)]">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium">
                      {phase.number}. {phase.title}
                    </div>
                    <span className="text-xs text-[var(--text-muted)]">
                      {done}/{total}
                    </span>
                  </div>
                  <Meter value={done} max={total} className="mt-2" />
                </Card>
              </Link>
            );
          })}
        </div>
        <h2 className="mb-4 mt-8 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Phases — Model Training
        </h2>
        <div className="space-y-3">
          {PHASES.filter((p) => p.pathId === "training").map((phase) => {
            const quests = QUESTS.filter((q) => q.phaseId === phase.id);
            const total = quests.reduce((s, q) => s + q.tasks.length, 0);
            const done = quests.reduce(
              (s, q) => s + q.tasks.filter((t) => doneTaskIds.has(t.id)).length,
              0,
            );
            return (
              <Link key={phase.id} href="/quests" className="block">
                <Card className="px-4 py-3 transition-colors hover:border-[var(--accent)]">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium">
                      {phase.number}. {phase.title}
                    </div>
                    <span className="text-xs text-[var(--text-muted)]">
                      {done}/{total}
                    </span>
                  </div>
                  <Meter value={done} max={total} className="mt-2" />
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
