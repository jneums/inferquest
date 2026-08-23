import type { Metadata } from "next";
import Link from "next/link";
import { PATHS, PHASES_BY_ID, QUESTS, questsForPathPhase } from "@/data/curriculum";
import { QuestCard } from "@/components/QuestCard";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "The Quest Map — Inference Engineering & Model Training",
  description:
    "Two verified learning paths: Inference Engineering (KV caching, CUDA and Triton kernels, production vLLM serving) and Model Training (pretraining on a budget, scaling laws, SFT, DPO and GRPO) — sharing one trunk of fundamentals, every phase ending in a verified milestone.",
  alternates: { canonical: "/quests" },
};

export default function QuestsPage() {
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "InferQuest quest map",
    numberOfItems: QUESTS.length,
    itemListElement: QUESTS.map((q, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: q.title,
      url: `${SITE_URL}/quests/${q.id}`,
    })),
  };

  return (
    <div className="space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Quest map</h1>
        <p className="mt-1 max-w-2xl text-[var(--text-secondary)]">
          Two paths, one shared trunk of fundamentals. Progress and XP are one
          pool — a trunk quest finished on either path counts for both. Quests
          unlock when their prerequisites are at least half done.
        </p>
      </div>

      {PATHS.map((path, pi) => (
        <div key={path.id} className="space-y-10">
          <section className="border-t-[3px] border-[var(--ink)] pt-6">
            <div className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
              Path {String(pi + 1).padStart(2, "0")}
            </div>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight">
              {path.title}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)]">
              {path.tagline}
            </p>
          </section>

          {path.phaseIds.map((phaseId) => {
            const phase = PHASES_BY_ID.get(phaseId);
            if (!phase) return null;
            const quests = questsForPathPhase(path.id, phaseId);
            if (quests.length === 0) return null;
            const sharedIntoThisPath = !phase.pathId && path.id !== "inference";

            // Trunk phases borrowed from the inference ordering render as
            // compact waypoints here — their full cards live under Path 01.
            if (sharedIntoThisPath) {
              return (
                <section
                  key={`${path.id}-${phaseId}`}
                  className="border border-[var(--border)] bg-[var(--surface-1)] px-5 py-4"
                >
                  <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Shared trunk · Phase {phase.number} — {phase.title}
                  </div>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    {quests.map((q, i) => (
                      <span key={q.id}>
                        {i > 0 && " · "}
                        <Link
                          href={`/quests/${q.id}`}
                          className="font-medium text-[var(--text-primary)] underline decoration-[var(--border)] underline-offset-2 hover:decoration-[var(--accent)]"
                        >
                          {q.title}
                        </Link>
                      </span>
                    ))}
                  </p>
                </section>
              );
            }

            return (
              <section
                key={`${path.id}-${phaseId}`}
                className="border-t-[3px] border-[var(--ink)] pt-6"
              >
                <div className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                  Phase {phase.number} · {phase.theme}
                </div>
                <h3 className="mt-2 text-2xl font-extrabold tracking-tight">
                  {phase.title}
                </h3>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)]">
                  {phase.description}
                </p>
                <div className="mt-8 grid gap-5 sm:grid-cols-2">
                  {quests.map((quest) => (
                    <QuestCard key={quest.id} quest={quest} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ))}
    </div>
  );
}
