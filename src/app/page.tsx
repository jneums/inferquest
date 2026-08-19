"use client";

import Link from "next/link";
import { PHASES, QUESTS, TOTAL_XP } from "@/data/curriculum";
import { ACHIEVEMENTS } from "@/data/achievements";
import { levelForXP, nextLevel } from "@/lib/levels";
import { useProgress } from "@/lib/progress";
import { Heatmap } from "@/components/Heatmap";
import { Card, Meter, StatTile } from "@/components/ui";

export default function Dashboard() {
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

  const upNext = QUESTS.find((q) => {
    const { done, total } = questCompletion(q.id);
    return isQuestUnlocked(q.id) && done < total;
  });
  const nextTask = upNext?.tasks.find((t) => !doneTaskIds.has(t.id));

  return (
    <div className="space-y-8">
      {/* Hero: current level + XP toward the next */}
      <section>
        <div className="text-sm text-[var(--text-secondary)]">
          Level {level.n}
        </div>
        <h1 className="text-4xl font-semibold tracking-tight">{level.title}</h1>
        <div className="mt-4 max-w-xl">
          <Meter
            value={xp - level.minXP}
            max={(next?.minXP ?? xp) - level.minXP || 1}
          />
          <div className="mt-1.5 text-sm text-[var(--text-secondary)]">
            {next
              ? `${xp.toLocaleString()} XP — ${(next.minXP - xp).toLocaleString()} to Level ${next.n}: ${next.title}`
              : `${xp.toLocaleString()} XP — max level reached. Go get paid.`}
          </div>
        </div>
      </section>

      {/* Stat tiles */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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

      {/* Up next */}
      {upNext && nextTask && (
        <section>
          <h2 className="mb-2 text-sm font-medium text-[var(--text-secondary)]">
            Up next
          </h2>
          <Link href={`/quests/${upNext.id}`} className="block">
            <Card className="px-4 py-3 transition-colors hover:border-[var(--baseline)]">
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
      <section>
        <h2 className="mb-2 text-sm font-medium text-[var(--text-secondary)]">
          Activity — XP per day, last year
        </h2>
        <Card className="px-4 py-4">
          <Heatmap xpByDay={xpByDay} />
        </Card>
      </section>

      {/* Phase progress */}
      <section>
        <h2 className="mb-2 text-sm font-medium text-[var(--text-secondary)]">
          Phases
        </h2>
        <div className="space-y-2">
          {PHASES.map((phase) => {
            const quests = QUESTS.filter((q) => q.phaseId === phase.id);
            const total = quests.reduce((s, q) => s + q.tasks.length, 0);
            const done = quests.reduce(
              (s, q) => s + q.tasks.filter((t) => doneTaskIds.has(t.id)).length,
              0,
            );
            return (
              <Link key={phase.id} href="/quests" className="block">
                <Card className="px-4 py-3 transition-colors hover:border-[var(--baseline)]">
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
