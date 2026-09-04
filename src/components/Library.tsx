"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { PHASES, phaseLabel } from "@/data/curriculum";
import { KIND_LABEL, KIND_ORDER, LIBRARY } from "@/data/library";
import type { LibraryEntry } from "@/lib/types";
import { Card } from "@/components/ui";

/* Only phases some entry actually serves get a chip — an empty filter
 * result is a dead end, not a feature. */
const SERVED_PHASES = PHASES.filter((p) =>
  LIBRARY.some((e) => e.phaseIds.includes(p.id)),
);
const SERVED_IDS = new Set(SERVED_PHASES.map((p) => p.id));

function EntryCard({ entry }: { entry: LibraryEntry }) {
  const phases = PHASES.filter((p) => entry.phaseIds.includes(p.id));
  return (
    <Card id={entry.id} className="scroll-mt-20 px-5 py-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <a
          href={entry.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-lg font-bold tracking-tight underline decoration-[var(--accent)] decoration-2 underline-offset-4 hover:text-[var(--accent-strong)]"
        >
          {entry.title} <span aria-hidden>↗</span>
        </a>
        <span className="text-sm text-[var(--text-secondary)]">
          {entry.author}
          {entry.year ? `, ${entry.year}` : ""}
        </span>
        <span className="ml-auto flex gap-1.5">
          <span className="border border-[var(--border)] px-2 py-0.5 font-mono text-[11px] text-[var(--text-secondary)]">
            {entry.kind}
          </span>
          <span
            className={`border px-2 py-0.5 font-mono text-[11px] ${
              entry.access === "free"
                ? "border-[var(--border)] text-[var(--text-secondary)]"
                : "border-[var(--accent-strong)] text-[var(--accent-strong)]"
            }`}
          >
            {entry.access}
          </span>
        </span>
      </div>
      {entry.guidance && (
        <p className="mt-2 font-mono text-xs leading-relaxed text-[var(--text-muted)]">
          {entry.guidance}
        </p>
      )}
      <div className="mt-3 max-w-2xl space-y-3">
        {entry.why.map((p) => (
          <p
            key={p.slice(0, 40)}
            className="text-sm leading-relaxed text-[var(--text-secondary)]"
          >
            {p}
          </p>
        ))}
      </div>
      <div className="mt-3 text-xs text-[var(--text-muted)]">
        Serves:{" "}
        {phases.map((p, i) => (
          <span key={p.id}>
            {i > 0 && " · "}
            <Link
              href="/quests"
              className="underline underline-offset-2 hover:text-[var(--text-primary)]"
            >
              {phaseLabel(p)}: {p.title}
            </Link>
          </span>
        ))}
      </div>
    </Card>
  );
}

/* The URL is the filter state, so ?phase= links are shareable and
 * back/forward works. The server snapshot is "" (All): the prerendered HTML
 * always carries the full list, and a linked filter applies on hydration. */
const PHASE_EVENT = "library-phase";
const subscribe = (cb: () => void) => {
  window.addEventListener("popstate", cb);
  window.addEventListener(PHASE_EVENT, cb);
  return () => {
    window.removeEventListener("popstate", cb);
    window.removeEventListener(PHASE_EVENT, cb);
  };
};
const getPhaseSnapshot = () => {
  const p = new URLSearchParams(window.location.search).get("phase");
  return p && SERVED_IDS.has(p) ? p : "";
};

export function Library() {
  const phase =
    useSyncExternalStore(subscribe, getPhaseSnapshot, () => "") || null;

  const pick = (p: string | null) => {
    window.history.replaceState(
      null,
      "",
      p ? `/library?phase=${p}` : "/library",
    );
    window.dispatchEvent(new Event(PHASE_EVENT));
  };

  const groups = useMemo(() => {
    const visible = phase
      ? LIBRARY.filter((e) => e.phaseIds.includes(phase))
      : LIBRARY;
    return KIND_ORDER.map((kind) => ({
      kind,
      entries: visible.filter((e) => e.kind === kind),
    })).filter((g) => g.entries.length > 0);
  }, [phase]);

  const chip = (active: boolean) =>
    `border px-2.5 py-1 font-mono text-xs transition-colors ${
      active
        ? "border-[var(--ink)] bg-[var(--ink)] font-semibold text-[var(--on-ink)]"
        : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--ink)] hover:text-[var(--text-primary)]"
    }`;

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap gap-1.5">
        <button className={chip(phase === null)} onClick={() => pick(null)}>
          All
        </button>
        {SERVED_PHASES.map((p) => (
          <button
            key={p.id}
            className={chip(phase === p.id)}
            onClick={() => pick(p.id)}
            title={p.title}
          >
            {phaseLabel(p)}
          </button>
        ))}
      </div>

      {groups.map((g) => (
        <section key={g.kind} className="border-t-[3px] border-[var(--ink)] pt-6">
          <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
            {KIND_LABEL[g.kind]}
          </h2>
          <div className="mt-5 space-y-5">
            {g.entries.map((e) => (
              <EntryCard key={e.id} entry={e} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
