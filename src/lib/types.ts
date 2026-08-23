export type TaskKind =
  | "read" // articles, docs, book chapters
  | "watch" // lectures, talks
  | "paper" // research papers
  | "build" // write code
  | "kernel" // GPU kernel work
  | "bench" // benchmarking / profiling
  | "oss" // open-source contribution
  | "write" // blog posts, notes, resume
  | "quiz"; // graded drill

/**
 * Automated verification specs. Tasks with a verifier cannot be self-checked;
 * they complete only when the verifier passes (enforced server-side).
 */
export type Verifier =
  /** Server probes a user-supplied endpoint URL with a conformance suite. */
  | {
      type: "endpoint";
      suite: "openai-compat" | "latency";
      /** For latency suites: thresholds the probe must observe. */
      thresholds?: { ttftMsMax?: number; tokensPerSecMin?: number };
    }
  /** Server checks a GitHub PR is real, merged, and non-trivial. */
  | { type: "github-pr"; repoAllowlist?: string[] }
  /** Server checks a published URL is live and substantial. */
  | { type: "url"; mustContainAny?: string[]; minWords?: number }
  /** User runs the local GPU harness; server validates the report. */
  | {
      type: "harness";
      script: string;
      /** metric name -> requirement, checked against report.metrics */
      metrics: Record<string, { op: ">=" | "<="; value: number }>;
    }
  /** Server-graded quiz; questions served without answers. */
  | { type: "quiz"; quizId: string; passPct: number };

export interface Task {
  id: string;
  title: string;
  kind: TaskKind;
  xp: number;
  detail?: string;
  link?: string;
  verifier?: Verifier;
}

export type PathId = "inference" | "training";

/** A learning path: an ordered walk through phases toward one job family.
 * Phases (and their quests) can be shared between paths; XP is one pool. */
export interface LearningPath {
  id: PathId;
  title: string;
  tagline: string;
  /** Display order of phases on this path. Shared phases may appear in both. */
  phaseIds: string[];
}

export interface Quest {
  id: string;
  title: string;
  tagline: string;
  phaseId: string;
  /** Paths this quest belongs to. Omitted = ["inference"] (the original path). */
  paths?: PathId[];
  /** Quest ids that must each be ≥50% complete before this quest unlocks. */
  prereqs: string[];
  /**
   * Editorial paragraphs: why these sources over the alternatives, what to
   * look out for in them, how the quest connects to the rest of the map.
   * Not a summary of the material — the sources speak for themselves.
   */
  briefing?: string[];
  tasks: Task[];
}

/** Top-level grouping on the quest map. Foundations phases hold the shared
 * trunk; the other two hold each path's exclusive phases. Numbering is
 * contiguous WITHIN a section. */
export type PhaseSection = "foundations" | "inference" | "training";

export interface Phase {
  id: string;
  number: number;
  title: string;
  theme: string;
  description: string;
  section: PhaseSection;
}

export interface XPEvent {
  taskId: string;
  xp: number;
  /** Local date the task was completed, as YYYY-MM-DD. */
  date: string;
  /** Epoch ms, for ordering. */
  at: number;
}

export interface ProgressState {
  version: 1;
  events: XPEvent[];
}

export interface Level {
  n: number;
  title: string;
  minXP: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
}
