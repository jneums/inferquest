"use client";

import Link from "next/link";
import { QUESTS_BY_ID } from "@/data/curriculum";
import { useProgress } from "@/lib/progress";
import type { Quest } from "@/lib/types";
import { IconCheck, IconLock } from "@/components/icons";
import { Card, Meter } from "./ui";

export function QuestCard({ quest }: { quest: Quest }) {
  const { synced, isQuestUnlocked, questCompletion } = useProgress();
  // Signed-out visitors browse everything as a read-only preview.
  const unlocked = !synced || isQuestUnlocked(quest.id);
  const { done, total } = questCompletion(quest.id);
  const totalXP = quest.tasks.reduce((s, t) => s + t.xp, 0);
  const complete = synced && done === total;

  const body = (
    <Card
      className={`h-full px-4 py-3 transition-colors ${
        unlocked
          ? "hover:border-[var(--accent)]"
          : "border-dashed opacity-70"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 font-medium">
          {complete && <IconCheck size={14} className="shrink-0 text-[var(--accent)]" />}
          {!unlocked && <IconLock size={14} className="shrink-0 text-[var(--text-muted)]" />}
          {quest.title}
        </div>
        <span className="whitespace-nowrap text-xs text-[var(--text-muted)]">
          {totalXP} XP
        </span>
      </div>
      <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
        {quest.tagline}
      </p>
      {!synced ? (
        <p className="mt-3 text-xs text-[var(--text-muted)]">
          {total} tasks
        </p>
      ) : unlocked ? (
        <div className="mt-3 flex items-center gap-2">
          <Meter value={done} max={total} className="flex-1" />
          <span className="text-xs text-[var(--text-muted)]">
            {done}/{total}
          </span>
        </div>
      ) : (
        <p className="mt-3 text-xs text-[var(--text-muted)]">
          Unlocks at 50% of{" "}
          {quest.prereqs
            .map((id) => QUESTS_BY_ID.get(id)?.title ?? id)
            .join(" and ")}
        </p>
      )}
    </Card>
  );

  return unlocked ? (
    <Link href={`/quests/${quest.id}`} className="block h-full">
      {body}
    </Link>
  ) : (
    body
  );
}
