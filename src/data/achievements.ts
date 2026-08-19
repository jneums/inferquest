import { PHASES, QUESTS, TASKS_BY_ID } from "./curriculum";
import { levelForXP } from "@/lib/levels";
import type { Achievement, TaskKind, XPEvent } from "@/lib/types";

export interface AchievementDef extends Achievement {
  earned: (ctx: AchievementContext) => boolean;
}

export interface AchievementContext {
  doneTaskIds: Set<string>;
  events: XPEvent[];
  xp: number;
  streak: number;
  longestStreak: number;
}

function doneOfKind(done: Set<string>, kind: TaskKind): number {
  let n = 0;
  for (const id of done) {
    if (TASKS_BY_ID.get(id)?.kind === kind) n++;
  }
  return n;
}

function phaseComplete(done: Set<string>, phaseId: string): boolean {
  return QUESTS.filter((q) => q.phaseId === phaseId).every((q) =>
    q.tasks.every((t) => done.has(t.id)),
  );
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "first-blood",
    title: "First Token",
    description: "Complete your first task.",
    emoji: "🎯",
    earned: ({ doneTaskIds }) => doneTaskIds.size >= 1,
  },
  {
    id: "forward-passed",
    title: "Forward Passed",
    description: "Build the GPT-2 forward pass from scratch.",
    emoji: "🧠",
    earned: ({ doneTaskIds }) => doneTaskIds.has("fp-implement"),
  },
  {
    id: "cache-money",
    title: "Cache Money",
    description: "Implement a KV cache and benchmark the speedup.",
    emoji: "💰",
    earned: ({ doneTaskIds }) =>
      doneTaskIds.has("kv-implement") && doneTaskIds.has("kv-measure"),
  },
  {
    id: "paper-trail",
    title: "Paper Trail",
    description: "Read 4 research papers.",
    emoji: "📄",
    earned: ({ doneTaskIds }) => doneOfKind(doneTaskIds, "paper") >= 4,
  },
  {
    id: "kernel-hacker",
    title: "Kernel Hacker",
    description: "Write your first GPU kernel.",
    emoji: "⚡",
    earned: ({ doneTaskIds }) => doneOfKind(doneTaskIds, "kernel") >= 1,
  },
  {
    id: "benchmark-baron",
    title: "Benchmark Baron",
    description: "Complete 5 benchmarking or profiling tasks.",
    emoji: "📊",
    earned: ({ doneTaskIds }) => doneOfKind(doneTaskIds, "bench") >= 5,
  },
  {
    id: "open-sourcerer",
    title: "Open Sourcerer",
    description: "Get your first PR merged into an inference engine.",
    emoji: "🔮",
    earned: ({ doneTaskIds }) => doneTaskIds.has("oss-pr1"),
  },
  {
    id: "scribe",
    title: "The Scribe",
    description: "Publish 3 pieces of public writing.",
    emoji: "✍️",
    earned: ({ doneTaskIds }) => doneOfKind(doneTaskIds, "write") >= 3,
  },
  {
    id: "week-streak",
    title: "Warm Cache",
    description: "Hit a 7-day streak.",
    emoji: "🔥",
    earned: ({ longestStreak }) => longestStreak >= 7,
  },
  {
    id: "month-streak",
    title: "Monk Mode",
    description: "Hit a 30-day streak.",
    emoji: "🧘",
    earned: ({ longestStreak }) => longestStreak >= 30,
  },
  {
    id: "halfway",
    title: "Reaching Cruise Altitude",
    description: "Reach level 5.",
    emoji: "🚀",
    earned: ({ xp }) => levelForXP(xp).n >= 5,
  },
  ...PHASES.map((phase) => ({
    id: `phase-${phase.id}`,
    title: `${phase.theme} Cleared`,
    description: `Complete every task in Phase ${phase.number}: ${phase.title}.`,
    emoji: ["🏛️", "🔩", "🏭", "🏆"][phase.number - 1] ?? "🏅",
    earned: ({ doneTaskIds }: AchievementContext) =>
      phaseComplete(doneTaskIds, phase.id),
  })),
  {
    id: "ascension",
    title: "Inference Engineer",
    description: "Reach level 10. The title is yours.",
    emoji: "👑",
    earned: ({ xp }) => levelForXP(xp).n >= 10,
  },
];
