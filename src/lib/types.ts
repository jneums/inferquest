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
  /** Library entry this task is drawn from, when one exists. Cross-reference
   *  only — the task keeps its own `link` and renders unchanged. */
  libraryId?: string;
}

export type LibraryKind =
  | "book"
  | "course" // multi-part video/lecture series
  | "post" // a single article or blog post
  | "paper"
  | "podcast"
  | "reference"; // glossaries, galleries, docs you consult rather than read

/** A curated source on /library: recommended, never assigned — no XP, no
 *  checkbox. The curriculum's bibliography with a permanent address. */
export interface LibraryEntry {
  id: string; // kebab-case, stable; used as the #anchor and in cross-refs
  title: string;
  author: string;
  kind: LibraryKind;
  url: string; // canonical outbound link (https)
  year?: number;
  access: "free" | "paid";
  /** Phases this entry serves. Drives filtering and the quest-page strip. */
  phaseIds: string[];
  /** Finer targeting: quests that should show this entry. If omitted, the
   *  entry shows on every quest in its phaseIds. */
  questIds?: string[];
  /** Editorial, briefing voice: why this source over the alternatives, what
   *  to skip, where it pays off on the map. 1–3 short paragraphs. */
  why: string[];
  /** Reading guidance, e.g. "Chapters 5–7". Rendered as a mono line. */
  guidance?: string;
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
