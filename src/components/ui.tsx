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
      className={`rounded-xl border border-[var(--border)] bg-[var(--surface-1)] ${className}`}
    >
      {children}
    </div>
  );
}

/** Meter per the mark spec: accent fill, lighter step of the same ramp as track. */
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
      className={`h-2 overflow-hidden rounded-full bg-[var(--accent-track)] ${className}`}
    >
      <div
        className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-300"
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
      <div className="text-xs text-[var(--text-secondary)]">{label}</div>
      <div className="mt-0.5 text-2xl font-semibold">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-[var(--text-muted)]">{sub}</div>}
    </Card>
  );
}

export const KIND_META: Record<TaskKind, { label: string; dot: string }> = {
  read: { label: "Read", dot: "#2a78d6" },
  watch: { label: "Watch", dot: "#4a3aa7" },
  paper: { label: "Paper", dot: "#e87ba4" },
  build: { label: "Build", dot: "#1baf7a" },
  kernel: { label: "Kernel", dot: "#eb6834" },
  bench: { label: "Benchmark", dot: "#eda100" },
  oss: { label: "Open source", dot: "#008300" },
  write: { label: "Write", dot: "#e34948" },
};

export function KindChip({ kind }: { kind: TaskKind }) {
  const meta = KIND_META[kind];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--text-secondary)]">
      <span
        aria-hidden
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: meta.dot }}
      />
      {meta.label}
    </span>
  );
}

export function XPPill({ xp }: { xp: number }) {
  return (
    <span className="whitespace-nowrap rounded-full bg-[var(--accent-track)] px-2 py-0.5 text-xs font-medium">
      +{xp} XP
    </span>
  );
}
