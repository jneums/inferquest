export type TaskKind =
  | "read" // articles, docs, book chapters
  | "watch" // lectures, talks
  | "paper" // research papers
  | "build" // write code
  | "kernel" // GPU kernel work
  | "bench" // benchmarking / profiling
  | "oss" // open-source contribution
  | "write"; // blog posts, notes, resume

export interface Task {
  id: string;
  title: string;
  kind: TaskKind;
  xp: number;
  detail?: string;
  link?: string;
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
