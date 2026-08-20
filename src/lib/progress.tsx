"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useUser } from "@clerk/nextjs";
import { QUESTS, QUESTS_BY_ID, TASKS_BY_ID } from "@/data/curriculum";
import { ACHIEVEMENTS } from "@/data/achievements";
import type { ProgressState, Quest, XPEvent } from "./types";
import type { CheckResult } from "@/server/verifiers/net";

const STORAGE_KEY = "inference-engineer-progress-v1";
const MERGED_FLAG = "inferquest-merged-v1";

/** Curriculum tasks plus synthetic daily-review completions. */
function isKnownEventId(id: string): boolean {
  return TASKS_BY_ID.has(id) || /^review-\d{4}-\d{2}-\d{2}$/.test(id);
}

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

// ── localStorage store (anonymous visitors) ─────────────────────────────────

const DEFAULT_STATE: ProgressState = { version: 1, events: [] };

function parseState(raw: string | null): ProgressState {
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as ProgressState;
      if (parsed.version === 1 && Array.isArray(parsed.events)) {
        parsed.events = parsed.events.filter((e) => isKnownEventId(e.taskId));
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
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function updateLocalState(updater: (prev: ProgressState) => ProgressState): void {
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

// ── React context ───────────────────────────────────────────────────────────

export interface VerifyOutcome {
  passed: boolean;
  checks: CheckResult[];
  error?: string;
}

export interface Progress {
  /** False until the active source (localStorage or API) has loaded. */
  ready: boolean;
  /** True when progress is backed by the server (signed in). */
  synced: boolean;
  events: XPEvent[];
  doneTaskIds: Set<string>;
  xp: number;
  streak: number;
  longestStreak: number;
  xpByDay: Map<string, number>;
  earnedAchievementIds: Set<string>;
  toggleTask: (taskId: string) => void;
  /** Runs a task's verifier server-side. Requires sign-in. */
  submitVerification: (taskId: string, submission: unknown) => Promise<VerifyOutcome>;
  isQuestUnlocked: (questId: string) => boolean;
  questCompletion: (questId: string) => { done: number; total: number };
  resetAll: () => void;
}

const ProgressContext = createContext<Progress | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded, user } = useUser();
  const localState = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  // Server progress is keyed by user id, so a signed-out render (or a
  // different user) simply doesn't match — no reset-on-signout state writes.
  const [serverState, setServerState] = useState<{
    forUser: string;
    events: XPEvent[];
  } | null>(null);
  const mergeStarted = useRef(false);

  const loadServer = useCallback(async (uid: string) => {
    const res = await fetch("/api/progress");
    if (res.ok) {
      const data = (await res.json()) as { events: XPEvent[] };
      setServerState({
        forUser: uid,
        events: data.events.filter((e) => isKnownEventId(e.taskId)),
      });
    }
  }, []);

  // On sign-in: one-time merge of pre-signup localStorage progress, then load.
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user?.id) {
      mergeStarted.current = false;
      return;
    }
    const uid = user.id;
    let cancelled = false;
    (async () => {
      const flag = `${MERGED_FLAG}:${uid}`;
      const local = getSnapshot().events;
      if (!localStorage.getItem(flag) && local.length > 0 && !mergeStarted.current) {
        mergeStarted.current = true;
        try {
          await fetch("/api/progress/merge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              events: local.map((e) => ({ taskId: e.taskId, date: e.date })),
            }),
          });
          localStorage.setItem(flag, "1");
        } catch {
          // merge is best-effort; the toggle path still works
        }
      }
      if (!cancelled) await loadServer(uid);
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, user?.id, user, loadServer]);

  const synced = Boolean(isSignedIn);
  const serverReady = synced && serverState?.forUser === user?.id;

  const toggleTask = useCallback(
    (taskId: string) => {
      const task = TASKS_BY_ID.get(taskId);
      if (!task || task.verifier) return;
      const date = todayKey();
      if (!synced) {
        updateLocalState((prev) => {
          const exists = prev.events.some((e) => e.taskId === taskId);
          const events = exists
            ? prev.events.filter((e) => e.taskId !== taskId)
            : [...prev.events, { taskId, xp: task.xp, date, at: Date.now() }];
          return { ...prev, events };
        });
        return;
      }
      if (!serverReady || !serverState) return;
      const exists = serverState.events.some((e) => e.taskId === taskId);
      const optimistic = exists
        ? serverState.events.filter((e) => e.taskId !== taskId)
        : [...serverState.events, { taskId, xp: task.xp, date, at: Date.now() }];
      setServerState({ ...serverState, events: optimistic });
      fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, done: !exists, date }),
      }).then((res) => {
        if (!res.ok) loadServer(serverState.forUser); // revert to server truth
      });
    },
    [synced, serverReady, serverState, loadServer],
  );

  const submitVerification = useCallback(
    async (taskId: string, submission: unknown): Promise<VerifyOutcome> => {
      if (!synced || !user?.id) {
        return { passed: false, checks: [], error: "Sign in to run verification." };
      }
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, date: todayKey(), submission }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        return { passed: false, checks: [], error: body?.error ?? `HTTP ${res.status}` };
      }
      const data = (await res.json()) as { passed: boolean; checks: CheckResult[] };
      if (data.passed) await loadServer(user.id);
      return data;
    },
    [synced, user, loadServer],
  );

  const resetAll = useCallback(() => {
    if (!synced) updateLocalState(() => ({ version: 1, events: [] }));
    // Server-side reset is deliberately not exposed — completions are earned.
  }, [synced]);

  const value = useMemo<Progress>(() => {
    const events = synced
      ? serverReady
        ? serverState!.events
        : []
      : localState.events;
    const ready = synced ? serverReady : hydrated;
    const doneTaskIds = new Set(events.map((e) => e.taskId));
    const xp = events.reduce((s, e) => s + e.xp, 0);
    const xpByDay = new Map<string, number>();
    for (const e of events) {
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

    const ctx = { doneTaskIds, events, xp, streak, longestStreak };
    const earnedAchievementIds = new Set(
      ACHIEVEMENTS.filter((a) => a.earned(ctx)).map((a) => a.id),
    );

    return {
      ready,
      synced,
      events,
      doneTaskIds,
      xp,
      streak,
      longestStreak,
      xpByDay,
      earnedAchievementIds,
      toggleTask,
      submitVerification,
      isQuestUnlocked,
      questCompletion,
      resetAll,
    };
  }, [
    synced,
    serverReady,
    serverState,
    localState,
    hydrated,
    toggleTask,
    submitVerification,
    resetAll,
  ]);

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
