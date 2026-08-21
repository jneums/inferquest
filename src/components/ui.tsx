"use client";

import type { ReactNode } from "react";
import type { TaskKind } from "@/lib/types";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`border border-[var(--border)] bg-[var(--surface-1)] ${className}`}
    >
      {children}
    </div>
  );
}

/** Segmented phosphor meter: discrete blocks fill left to right. Uses one
 * segment per unit when max is small (task counts), else a fixed 12. */
export function Meter({
  value,
  max,
  className = "",
}: {
  value: number;
  max: number;
  className?: string;
}) {
  const segments = max > 0 && max <= 16 ? max : 12;
  const filled = max > 0 ? Math.round((Math.min(value, max) / max) * segments) : 0;
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={`flex gap-[3px] ${className}`}
    >
      {Array.from({ length: segments }, (_, i) => (
        <span
          key={i}
          className={`h-2 flex-1 ${
            i < filled ? "bg-[var(--accent)]" : "bg-[var(--accent-track)]"
          }`}
        />
      ))}
    </div>
  );
}

/** Stat tile per the figure contract: label, semibold value, no trailing colon. */
export function StatTile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card className="px-4 py-3">
      <div className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)]">
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-[var(--text-muted)]">{sub}</div>}
    </Card>
  );
}

/* Categorical dots tuned for the phosphor surface. */
export const KIND_META: Record<TaskKind, { label: string; dot: string }> = {
  read: { label: "read", dot: "#58a6ff" },
  watch: { label: "watch", dot: "#bc8cff" },
  paper: { label: "paper", dot: "#f778ba" },
  build: { label: "build", dot: "#3fb950" },
  kernel: { label: "kernel", dot: "#ff9e64" },
  bench: { label: "bench", dot: "#e3b341" },
  oss: { label: "oss", dot: "#56d364" },
  write: { label: "write", dot: "#f85149" },
  quiz: { label: "drill", dot: "#8b949e" },
};

export function KindChip({ kind }: { kind: TaskKind }) {
  const meta = KIND_META[kind];
  return (
    <span className="inline-flex items-center gap-1.5 border border-[var(--border)] px-2 py-0.5 text-[11px] text-[var(--text-secondary)]">
      <span
        aria-hidden
        className="h-1.5 w-1.5"
        style={{ backgroundColor: meta.dot }}
      />
      {meta.label}
    </span>
  );
}

export function XPPill({ xp }: { xp: number }) {
  return (
    <span className="whitespace-nowrap bg-[var(--accent-track)] px-2 py-0.5 text-[11px] font-medium text-[var(--accent)]">
      +{xp} XP
    </span>
  );
}
