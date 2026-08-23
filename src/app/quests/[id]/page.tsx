import type { Metadata } from "next";
import { PHASES, QUESTS, QUESTS_BY_ID } from "@/data/curriculum";
import { QuestDetail } from "@/components/QuestDetail";
import { questJsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return QUESTS.map((q) => ({ id: q.id }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: PageProps<"/quests/[id]">): Promise<Metadata> {
  const { id } = await params;
  const quest = QUESTS_BY_ID.get(id);
  if (!quest) return {};
  const phase = PHASES.find((p) => p.id === quest.phaseId);
  const totalXP = quest.tasks.reduce((s, t) => s + t.xp, 0);
  const verified = quest.tasks.filter((t) => t.verifier).length;
  return {
    title: `${quest.title} — Phase ${phase?.number}: ${phase?.title}`,
    description: `${quest.tagline} ${quest.tasks.length} tasks worth ${totalXP} XP${verified > 0 ? `, ${verified} auto-verified` : ""}, in InferQuest's free LLM inference & training roadmaps.`,
    alternates: { canonical: `/quests/${id}` },
  };
}

export default async function QuestPage({
  params,
}: PageProps<"/quests/[id]">) {
  const { id } = await params;
  const jsonLd = questJsonLd(id);
  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <QuestDetail id={id} />
    </>
  );
}
