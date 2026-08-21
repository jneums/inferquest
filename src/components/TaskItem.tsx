"use client";

import { useState } from "react";
import { SignInButton } from "@clerk/nextjs";
import { useProgress } from "@/lib/progress";
import type { Task } from "@/lib/types";
import { CHECK_TASK_IDS } from "@/data/checkTasks";
import { CheckKnowledge } from "./CheckKnowledge";
import { VerifyPanel } from "./VerifyPanel";
import { IconCheck, IconLock, IconShield } from "@/components/icons";
import { KindChip, XPPill } from "./ui";

export function TaskItem({ task }: { task: Task }) {
  const { synced, doneTaskIds, toggleTask } = useProgress();
  const done = doneTaskIds.has(task.id);
  const verified = Boolean(task.verifier);
  const [open, setOpen] = useState(false);

  return (
    <li className="flex gap-3 border-b border-[var(--hairline)] py-3 last:border-b-0">
      {!synced ? (
        <SignInButton mode="modal">
          <button
            className="mt-1 w-4 shrink-0 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            title="Sign in to track progress"
            aria-label="Sign in to track progress"
          >
            <IconLock size={15} />
          </button>
        </SignInButton>
      ) : verified ? (
        <span
          className={`mt-1 w-4 shrink-0 ${done ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`}
          title="Completed by automated verification"
          aria-hidden
        >
          {done ? <IconCheck size={15} /> : <IconShield size={15} />}
        </span>
      ) : (
        <input
          type="checkbox"
          id={`task-${task.id}`}
          checked={done}
          onChange={() => toggleTask(task.id)}
          className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)]"
        />
      )}
      <div className="min-w-0 flex-1">
        <label
          htmlFor={verified || !synced ? undefined : `task-${task.id}`}
          onClick={synced && verified ? () => setOpen((o) => !o) : undefined}
          className={`cursor-pointer font-medium ${
            done ? "text-[var(--text-muted)] line-through" : ""
          }`}
        >
          {task.title}
        </label>
        {task.detail && (
          <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
            {task.detail}
          </p>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <KindChip kind={task.kind} />
          <XPPill xp={task.xp} />
          {verified && (
            <span className="inline-flex items-center gap-1.5 border border-[var(--accent)] px-2 py-0.5 text-[11px] font-medium text-[var(--accent)]">
              <IconShield size={11} />
              auto-verified
            </span>
          )}
          {synced && verified && !done && (
            <button
              onClick={() => setOpen((o) => !o)}
              className="border border-[var(--border)] px-2 py-0.5 text-[11px] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              {open ? "hide verifier" : "verify"}
            </button>
          )}
          {task.link && (
            <a
              href={task.link}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-[var(--accent-strong)] underline underline-offset-2"
            >
              resource ↗
            </a>
          )}
        </div>
        {synced && verified && (open || done) && <VerifyPanel task={task} />}
        {synced && CHECK_TASK_IDS.has(task.id) && <CheckKnowledge taskId={task.id} />}
      </div>
    </li>
  );
}
