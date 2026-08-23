import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Achievements",
  description:
    "XP, levels, streaks, and achievement badges earned across InferQuest's LLM inference and training roadmaps.",
  alternates: { canonical: "/achievements" },
};

export default function AchievementsLayout({
  children,
}: LayoutProps<"/achievements">) {
  return children;
}
