import type { Metadata } from "next";
import { PHASES, QUESTS, questsForPhase } from "@/data/curriculum";
import { QuestCard } from "@/components/QuestCard";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "The Inference Engineering Roadmap",
  description:
    "The full quest map: ten phases of inference engineering training, from transformer internals and KV caching through CUDA and Triton kernels to production vLLM serving and distributed inference — every phase ending in a verified milestone.",
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
        <p className="mt-1 text-[var(--text-secondary)]">
          The complete inference engineering roadmap: ten phases from
          &ldquo;what&rsquo;s a KV cache&rdquo; to a signed offer, with
          automatically verified milestones along the way. Quests unlock when
          their prerequisites are at least half done.
        </p>
      </div>

      {PHASES.map((phase) => (
        <section
          key={phase.id}
          className="border-t-[3px] border-[var(--ink)] pt-6"
        >
          <div className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
            Phase {phase.number} · {phase.theme}
          </div>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight">
            {phase.title}
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)]">
            {phase.description}
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {questsForPhase(phase.id).map((quest) => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
