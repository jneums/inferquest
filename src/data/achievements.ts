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

function doneVerified(done: Set<string>): number {
  let n = 0;
  for (const id of done) {
    if (TASKS_BY_ID.get(id)?.verifier) n++;
  }
  return n;
}

function phaseComplete(done: Set<string>, phaseId: string): boolean {
  return QUESTS.filter((q) => q.phaseId === phaseId).every((q) =>
    q.tasks.every((t) => done.has(t.id)),
  );
}

const PHASE_EMOJI = ["🪨", "🏛️", "⚙️", "🔩", "⚡", "🗜️", "🏭", "🌐", "📈", "🏆"];

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
    id: "graded",
    title: "Graded by the Machine",
    description: "Pass your first automated verifier.",
    emoji: "🛡️",
    earned: ({ doneTaskIds }) => doneVerified(doneTaskIds) >= 1,
  },
  {
    id: "cache-money",
    title: "Cache Money",
    description: "Pass the KV-cached decoder grader — exact logits, ≥2× speedup.",
    emoji: "💰",
    earned: ({ doneTaskIds }) => doneTaskIds.has("kv-harness"),
  },
  {
    id: "conformant",
    title: "Conformant",
    description: "An engine YOU BUILT passes the live OpenAI-compatibility probe.",
    emoji: "🔌",
    earned: ({ doneTaskIds }) => doneTaskIds.has("engine-endpoint"),
  },
  {
    id: "kernel-hacker",
    title: "Kernel Hacker",
    description: "Complete 5 kernel tasks.",
    emoji: "⚡",
    earned: ({ doneTaskIds }) => doneOfKind(doneTaskIds, "kernel") >= 5,
  },
  {
    id: "flash-certified",
    title: "Flash Certified",
    description: "Pass the flash-attention grader.",
    emoji: "🌩️",
    earned: ({ doneTaskIds }) => doneTaskIds.has("triton-flash-harness"),
  },
  {
    id: "paper-trail",
    title: "Paper Trail",
    description: "Read 10 research papers.",
    emoji: "📄",
    earned: ({ doneTaskIds }) => doneOfKind(doneTaskIds, "paper") >= 10,
  },
  {
    id: "benchmark-baron",
    title: "Benchmark Baron",
    description: "Complete 5 benchmarking or profiling tasks.",
    emoji: "📊",
    earned: ({ doneTaskIds }) => doneOfKind(doneTaskIds, "bench") >= 5,
  },
  {
    id: "production-grade",
    title: "Production Grade",
    description: "Your production endpoint passes BOTH the conformance and latency probes.",
    emoji: "🎛️",
    earned: ({ doneTaskIds }) =>
      doneTaskIds.has("vllm-endpoint") && doneTaskIds.has("bench-latency-verified"),
  },
  {
    id: "open-sourcerer",
    title: "Open Sourcerer",
    description: "First verified merged PR in a major inference repo.",
    emoji: "🔮",
    earned: ({ doneTaskIds }) => doneTaskIds.has("oss-pr1"),
  },
  {
    id: "scribe",
    title: "The Scribe",
    description: "Publish 3 verified pieces of public writing.",
    emoji: "✍️",
    earned: ({ doneTaskIds }) =>
      ["fa-writeup", "quant-writeup", "bench-publish", "econ-writeup"].filter((id) =>
        doneTaskIds.has(id),
      ).length >= 3,
  },
  {
    id: "drill-sergeant",
    title: "Drill Sergeant",
    description: "Pass all 7 graded drills.",
    emoji: "🎓",
    earned: ({ doneTaskIds }) =>
      ["kv-quiz", "batch-quiz", "spec-quiz", "prof-quiz", "quant-quiz", "par-quiz", "gauntlet-quiz"].every(
        (id) => doneTaskIds.has(id),
      ),
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
    title: "Cruise Altitude",
    description: "Reach level 6: Kernel Smith.",
    emoji: "🚀",
    earned: ({ xp }) => levelForXP(xp).n >= 6,
  },
  ...PHASES.map((phase, i) => ({
    id: `phase-${phase.id}`,
    title: `${phase.theme} Cleared`,
    description: `Complete every task in Phase ${phase.number}: ${phase.title}.`,
    emoji: PHASE_EMOJI[i] ?? "🏅",
    earned: ({ doneTaskIds }: AchievementContext) =>
      phaseComplete(doneTaskIds, phase.id),
  })),
  {
    id: "ascension",
    title: "Inference Engineer",
    description: "Reach level 12. The title is yours — go get paid.",
    emoji: "👑",
    earned: ({ xp }) => levelForXP(xp).n >= 12,
  },
];
