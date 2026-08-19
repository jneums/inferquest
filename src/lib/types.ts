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

export interface Quest {
  id: string;
  title: string;
  tagline: string;
  phaseId: string;
  /** Quest ids that must each be ≥50% complete before this quest unlocks. */
  prereqs: string[];
  tasks: Task[];
}

export interface Phase {
  id: string;
  number: number;
  title: string;
  theme: string;
  description: string;
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
