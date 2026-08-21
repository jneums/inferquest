import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Achievements",
  description:
    "XP, levels, streaks, and achievement badges earned on the InferQuest inference engineering roadmap.",
  alternates: { canonical: "/achievements" },
};

export default function AchievementsLayout({
  children,
}: LayoutProps<"/achievements">) {
  return children;
}
