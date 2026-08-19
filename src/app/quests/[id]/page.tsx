import { QUESTS } from "@/data/curriculum";
import { QuestDetail } from "@/components/QuestDetail";

export function generateStaticParams() {
  return QUESTS.map((q) => ({ id: q.id }));
}

export const dynamicParams = false;

export default async function QuestPage({
  params,
}: PageProps<"/quests/[id]">) {
  const { id } = await params;
  return <QuestDetail id={id} />;
}
