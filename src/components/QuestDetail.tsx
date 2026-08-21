"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { PHASES, QUESTS_BY_ID } from "@/data/curriculum";
import { useProgress } from "@/lib/progress";
import { IconEye, IconLock } from "@/components/icons";
import { TaskItem } from "@/components/TaskItem";
import { Card, Meter } from "@/components/ui";

export function QuestDetail({ id }: { id: string }) {
  const quest = QUESTS_BY_ID.get(id);
  const { synced, isQuestUnlocked, questCompletion } = useProgress();

  if (!quest) notFound();

  const phase = PHASES.find((p) => p.id === quest.phaseId);
  const unlocked = isQuestUnlocked(quest.id);
  const { done, total } = questCompletion(quest.id);
  const totalXP = quest.tasks.reduce((s, t) => s + t.xp, 0);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/quests"
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          ← Quest map
        </Link>
        <div className="mt-3 font-mono text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
          Phase {phase?.number} · {phase?.theme}
        </div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          {quest.title}
        </h1>
        <p className="mt-1 text-[var(--text-secondary)]">{quest.tagline}</p>
        <div className="mt-4 flex max-w-md items-center gap-3">
          <Meter value={done} max={total} className="flex-1" />
          <span className="whitespace-nowrap text-sm text-[var(--text-muted)]">
            {done}/{total} · {totalXP} XP
          </span>
        </div>
      </div>

      {!synced && (
        <Card className="flex items-start gap-2 border-[var(--accent)] px-4 py-3 text-sm text-[var(--text-secondary)]">
          <IconEye size={15} className="mt-0.5 shrink-0 text-[var(--accent)]" />
          <span>You&rsquo;re previewing the curriculum. Sign in (top right) to
          track progress, take knowledge checks, and unlock the verifiers.</span>
        </Card>
      )}

      {synced && !unlocked && (
        <Card className="flex items-start gap-2 border-[var(--baseline)] px-4 py-3 text-sm text-[var(--text-secondary)]">
          <IconLock size={15} className="mt-0.5 shrink-0 text-[var(--text-muted)]" />
          <span>This quest is locked — it unlocks when{" "}
          {quest.prereqs
            .map((pid) => QUESTS_BY_ID.get(pid)?.title ?? pid)
            .join(" and ")}{" "}
          {quest.prereqs.length > 1 ? "are" : "is"} at least 50% complete. You
          can still read ahead; checking tasks off works either way.</span>
        </Card>
      )}

      <Card className="px-4">
        <ul>
          {quest.tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </ul>
      </Card>
    </div>
  );
}
