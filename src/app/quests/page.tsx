import type { Metadata } from "next";
import {
  FOUNDATION_PHASE_IDS,
  PATHS,
  PHASES_BY_ID,
  QUESTS,
  exclusiveQuestsForPathPhase,
  foundationQuestsForPhase,
} from "@/data/curriculum";
import { QuestCard } from "@/components/QuestCard";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "The Quest Map — Foundations, Inference Engineering & Model Training",
  description:
    "One Foundations trunk (transformer internals, CUDA and Triton kernels, profiling, parallelism) feeding two verified paths: Inference Engineering (KV caching, production vLLM serving) and Model Training (pretraining on a budget, scaling laws, SFT/DPO/GRPO) — every phase ending in a verified milestone.",
  alternates: { canonical: "/quests" },
};

function PhaseSection({
  phaseId,
  quests,
}: {
  phaseId: string;
  quests: ReturnType<typeof foundationQuestsForPhase>;
}) {
  const phase = PHASES_BY_ID.get(phaseId);
  if (!phase || quests.length === 0) return null;
  return (
    <section className="border-t border-[var(--border)] pt-5">
      <div className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
        Phase {phase.number} · {phase.theme}
      </div>
      <h3 className="mt-2 text-2xl font-extrabold tracking-tight">
        {phase.title}
      </h3>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)]">
        {phase.description}
      </p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {quests.map((quest) => (
          <QuestCard key={quest.id} quest={quest} />
        ))}
      </div>
    </section>
  );
}

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
          One Foundations trunk, two specialist paths. Foundations quests count
          for both paths — progress and XP are a single pool — and each
          specialist quest unlocks when its prerequisites are at least half
          done, wherever they live.
        </p>
      </div>

      {/* ── Foundations: the shared trunk, path-neutral ── */}
      <div className="space-y-8">
        <section className="border-t-[3px] border-[var(--ink)] pt-6">
          <div className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
            The Trunk
          </div>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight">
            Foundations
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)]">
            The fundamentals both jobs are built on — performance mental
            models, transformer internals, GPU architecture, kernels,
            quantization theory, parallelism. Whichever path you're headed
            for, this is where it starts; finish a quest here once and it
            counts everywhere.
          </p>
        </section>
        {FOUNDATION_PHASE_IDS.map((pid) => (
          <PhaseSection
            key={pid}
            phaseId={pid}
            quests={foundationQuestsForPhase(pid)}
          />
        ))}
      </div>

      {/* ── The two specialist paths: exclusive quests only ── */}
      {PATHS.map((path, pi) => (
        <div key={path.id} className="space-y-8">
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
          {path.phaseIds.map((pid) => (
            <PhaseSection
              key={`${path.id}-${pid}`}
              phaseId={pid}
              quests={exclusiveQuestsForPathPhase(path.id, pid)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
