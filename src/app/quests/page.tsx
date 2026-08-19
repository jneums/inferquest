"use client";

import { PHASES } from "@/data/curriculum";
import { questsForPhase } from "@/lib/progress";
import { QuestCard } from "@/components/QuestCard";

export default function QuestsPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Quest map</h1>
        <p className="mt-1 text-[var(--text-secondary)]">
          Four phases from “what’s a KV cache” to a signed offer. Quests unlock
          when their prerequisites are at least half done.
        </p>
      </div>

      {PHASES.map((phase) => (
        <section key={phase.id}>
          <div className="mb-3 flex items-baseline gap-3">
            <span className="text-xs font-medium uppercase tracking-wide text-[var(--accent-strong)]">
              Phase {phase.number} · {phase.theme}
            </span>
          </div>
          <h2 className="text-xl font-semibold">{phase.title}</h2>
          <p className="mt-1 max-w-2xl text-sm text-[var(--text-secondary)]">
            {phase.description}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {questsForPhase(phase.id).map((quest) => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
