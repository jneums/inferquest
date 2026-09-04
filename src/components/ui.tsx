"use client";

import type { ReactNode } from "react";
import type { TaskKind } from "@/lib/types";

export function Card({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={`border border-[var(--border)] bg-[var(--surface-1)] ${className}`}
    >
      {children}
    </div>
  );
}

/** Manual meter: flat track, solid signal-orange fill, sharp. */
export function Meter({
  value,
  max,
  className = "",
}: {
  value: number;
  max: number;
  className?: string;
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={`h-2 bg-[var(--hairline)] ${className}`}
    >
      <div
        className="h-full bg-[var(--accent)] transition-[width] duration-300"
        style={{ width: `${pct}%` }}
      />
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
      <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)]">
        {label}
      </div>
      <div className="mt-1 text-2xl font-extrabold tracking-tight">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-[var(--text-muted)]">{sub}</div>}
    </Card>
  );
}

/* Categorical dots tuned for the phosphor surface. */
export const KIND_META: Record<TaskKind, { label: string; dot: string }> = {
  read: { label: "read", dot: "#0969da" },
  watch: { label: "watch", dot: "#8250df" },
  paper: { label: "paper", dot: "#bf3989" },
  build: { label: "build", dot: "#1a7f37" },
  kernel: { label: "kernel", dot: "#bc4c00" },
  bench: { label: "bench", dot: "#9a6700" },
  oss: { label: "oss", dot: "#2da44e" },
  write: { label: "write", dot: "#cf222e" },
  quiz: { label: "drill", dot: "#57606a" },
};

export function KindChip({ kind }: { kind: TaskKind }) {
  const meta = KIND_META[kind];
  return (
    <span className="inline-flex items-center gap-1.5 border border-[var(--border)] px-2 py-0.5 font-mono text-[11px] text-[var(--text-secondary)]">
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
    <span className="whitespace-nowrap bg-[var(--accent-track)] px-2 py-0.5 font-mono text-[11px] font-medium text-[var(--accent-strong)]">
      +{xp} XP
    </span>
  );
}
