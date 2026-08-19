"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { QUESTS, QUESTS_BY_ID, TASKS_BY_ID } from "@/data/curriculum";
import { ACHIEVEMENTS } from "@/data/achievements";
import type { ProgressState, Quest, XPEvent } from "./types";

const STORAGE_KEY = "inference-engineer-progress-v1";

export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(key: string, n: number): string {
  const [y, m, d] = key.split("-").map(Number);
  return todayKey(new Date(y, m - 1, d + n));
}

function computeStreaks(dates: Set<string>): {
  current: number;
  longest: number;
} {
  if (dates.size === 0) return { current: 0, longest: 0 };
  const sorted = [...dates].sort();
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    run = sorted[i] === addDays(sorted[i - 1], 1) ? run + 1 : 1;
    longest = Math.max(longest, run);
  }
  // Current streak counts back from today (or yesterday, so today isn't a fail until it's over).
  const today = todayKey();
  let anchor = dates.has(today) ? today : addDays(today, -1);
  if (!dates.has(anchor)) return { current: 0, longest };
  let current = 0;
  while (dates.has(anchor)) {
    current++;
    anchor = addDays(anchor, -1);
  }
  return { current, longest };
}

// ── localStorage-backed external store ──────────────────────────────────────

const DEFAULT_STATE: ProgressState = { version: 1, events: [] };

function parseState(raw: string | null): ProgressState {
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as ProgressState;
      if (parsed.version === 1 && Array.isArray(parsed.events)) {
        // Drop events for tasks that no longer exist in the curriculum.
        parsed.events = parsed.events.filter((e) => TASKS_BY_ID.has(e.taskId));
        return parsed;
      }
    } catch {
      // Corrupt storage — start fresh rather than crash.
    }
  }
  return DEFAULT_STATE;
}

let cachedRaw: string | null = null;
let cachedState: ProgressState = DEFAULT_STATE;
const listeners = new Set<() => void>();

function getSnapshot(): ProgressState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedState = parseState(raw);
  }
  return cachedState;
}

function getServerSnapshot(): ProgressState {
  return DEFAULT_STATE;
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  // Sync across tabs too — 'storage' fires when another tab writes the key.
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function updateState(updater: (prev: ProgressState) => ProgressState): void {
  const next = updater(getSnapshot());
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage full or unavailable — progress just won't persist.
  }
  cachedRaw = localStorage.getItem(STORAGE_KEY);
  cachedState = next;
  listeners.forEach((l) => l());
}

// ── React context over the store ────────────────────────────────────────────

export interface Progress {
  /** False during SSR/hydration — render zero-state until then. */
  ready: boolean;
  events: XPEvent[];
  doneTaskIds: Set<string>;
  xp: number;
  streak: number;
  longestStreak: number;
  /** XP earned per local day, for the heatmap. */
  xpByDay: Map<string, number>;
  earnedAchievementIds: Set<string>;
  toggleTask: (taskId: string) => void;
  isQuestUnlocked: (questId: string) => boolean;
  questCompletion: (questId: string) => { done: number; total: number };
  exportJSON: () => string;
  importJSON: (json: string) => boolean;
  resetAll: () => void;
}

const ProgressContext = createContext<Progress | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const toggleTask = useCallback((taskId: string) => {
    const task = TASKS_BY_ID.get(taskId);
    if (!task) return;
    updateState((prev) => {
      const exists = prev.events.some((e) => e.taskId === taskId);
      const events = exists
        ? prev.events.filter((e) => e.taskId !== taskId)
        : [
            ...prev.events,
            { taskId, xp: task.xp, date: todayKey(), at: Date.now() },
          ];
      return { ...prev, events };
    });
  }, []);

  const value = useMemo<Progress>(() => {
    const doneTaskIds = new Set(state.events.map((e) => e.taskId));
    const xp = state.events.reduce((s, e) => s + e.xp, 0);
    const xpByDay = new Map<string, number>();
    for (const e of state.events) {
      xpByDay.set(e.date, (xpByDay.get(e.date) ?? 0) + e.xp);
    }
    const { current: streak, longest: longestStreak } = computeStreaks(
      new Set(xpByDay.keys()),
    );

    const questCompletion = (questId: string) => {
      const quest = QUESTS_BY_ID.get(questId);
      if (!quest) return { done: 0, total: 0 };
      const done = quest.tasks.filter((t) => doneTaskIds.has(t.id)).length;
      return { done, total: quest.tasks.length };
    };

    const isQuestUnlocked = (questId: string) => {
      const quest = QUESTS_BY_ID.get(questId);
      if (!quest) return false;
      return quest.prereqs.every((pid) => {
        const { done, total } = questCompletion(pid);
        return total > 0 && done / total >= 0.5;
      });
    };

    const ctx = { doneTaskIds, events: state.events, xp, streak, longestStreak };
    const earnedAchievementIds = new Set(
      ACHIEVEMENTS.filter((a) => a.earned(ctx)).map((a) => a.id),
    );

    return {
      ready,
      events: state.events,
      doneTaskIds,
      xp,
      streak,
      longestStreak,
      xpByDay,
      earnedAchievementIds,
      toggleTask,
      isQuestUnlocked,
      questCompletion,
      exportJSON: () => JSON.stringify(state, null, 2),
      importJSON: (json: string) => {
        try {
          const parsed = JSON.parse(json) as ProgressState;
          if (parsed.version !== 1 || !Array.isArray(parsed.events)) return false;
          updateState(() => ({
            version: 1,
            events: parsed.events.filter((e) => TASKS_BY_ID.has(e.taskId)),
          }));
          return true;
        } catch {
          return false;
        }
      },
      resetAll: () => updateState(() => ({ version: 1, events: [] })),
    };
  }, [state, ready, toggleTask]);

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress(): Progress {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}

export function questsForPhase(phaseId: string): Quest[] {
  return QUESTS.filter((q) => q.phaseId === phaseId);
}
