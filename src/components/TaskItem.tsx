"use client";

import { useProgress } from "@/lib/progress";
import type { Task } from "@/lib/types";
import { KindChip, XPPill } from "./ui";

export function TaskItem({ task }: { task: Task }) {
  const { doneTaskIds, toggleTask } = useProgress();
  const done = doneTaskIds.has(task.id);

  return (
    <li className="flex gap-3 border-b border-[var(--hairline)] py-3 last:border-b-0">
      <input
        type="checkbox"
        id={`task-${task.id}`}
        checked={done}
        onChange={() => toggleTask(task.id)}
        className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)]"
      />
      <div className="min-w-0 flex-1">
        <label
          htmlFor={`task-${task.id}`}
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
      </div>
    </li>
  );
}
