"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { PHASES, QUESTS_BY_ID, phaseLabel } from "@/data/curriculum";
import { libraryForQuest } from "@/data/library";
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
  const libraryEntries = libraryForQuest(quest);

  return (
    <div className="space-y-10">
      <div className="pt-2">
        <Link
          href="/quests"
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          ← Quest map
        </Link>
        <div className="mt-6 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
          {phase ? `${phaseLabel(phase)} · ${phase.theme}` : ""}
        </div>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight">
          {quest.title}
        </h1>
        <p className="mt-3 text-lg text-[var(--text-secondary)]">{quest.tagline}</p>
        <div className="mt-6 flex max-w-md items-center gap-3">
          <Meter value={done} max={total} className="flex-1" />
          <span className="whitespace-nowrap text-sm text-[var(--text-muted)]">
            {done}/{total} · {totalXP} XP
          </span>
        </div>
      </div>

      {!synced && (
        <Card className="flex items-start gap-2 border-[var(--accent)] px-4 py-3 text-sm text-[var(--text-secondary)]">
          <IconEye size={15} className="mt-0.5 shrink-0 text-[var(--accent-strong)]" />
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
          {quest.prereqs.length > 1 ? "are" : "is"} at least 50% complete.
          Read ahead all you like — tasks stay read-only until then.</span>
        </Card>
      )}

      {quest.briefing && quest.briefing.length > 0 && (
        <div className="border-t-[3px] border-[var(--ink)] pt-6">
          <div className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
            Briefing
          </div>
          <div className="mt-5 max-w-2xl space-y-4">
            {quest.briefing.map((p) => (
              <p
                key={p.slice(0, 40)}
                className="text-base leading-relaxed text-[var(--text-secondary)]"
              >
                {p}
              </p>
            ))}
          </div>
        </div>
      )}

      {libraryEntries.length > 0 && (
        <div className="border-t-[3px] border-[var(--ink)] pt-6">
          <div className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
            From the library
          </div>
          <ul className="mt-5 space-y-2">
            {libraryEntries.slice(0, 5).map((e) => (
              <li
                key={e.id}
                className="flex flex-wrap items-baseline gap-x-2 text-sm"
              >
                <Link
                  href={`/library#${e.id}`}
                  className="font-semibold underline decoration-[var(--accent)] decoration-2 underline-offset-4 hover:text-[var(--accent-strong)]"
                >
                  {e.title}
                </Link>
                <span className="text-[var(--text-muted)]">{e.author}</span>
                <span className="border border-[var(--border)] px-1.5 font-mono text-[10px] text-[var(--text-secondary)]">
                  {e.kind}
                </span>
                <a
                  href={e.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${e.title}`}
                  className="text-[var(--text-muted)] hover:text-[var(--accent-strong)]"
                >
                  ↗
                </a>
              </li>
            ))}
          </ul>
          {libraryEntries.length > 5 && (
            <Link
              href="/library"
              className="mt-3 inline-block text-xs text-[var(--text-muted)] underline underline-offset-2 hover:text-[var(--text-primary)]"
            >
              and {libraryEntries.length - 5} more in the library
            </Link>
          )}
        </div>
      )}

      <div className="border-t-[3px] border-[var(--ink)] pt-6">
        <div className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Tasks
        </div>
        <Card className="mt-5 px-5">
          <ul>
            {quest.tasks.map((task) => (
              <TaskItem key={task.id} task={task} locked={synced && !unlocked} />
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
