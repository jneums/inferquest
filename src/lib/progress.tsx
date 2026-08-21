"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useUser } from "@clerk/nextjs";
import { QUESTS_BY_ID, TASKS_BY_ID, isQuestUnlockedFor } from "@/data/curriculum";
import { ACHIEVEMENTS } from "@/data/achievements";
import type { XPEvent } from "./types";
import type { CheckResult } from "@/server/verifiers/net";

export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Curriculum tasks plus synthetic daily-review completions. */
function isKnownEventId(id: string): boolean {
  return TASKS_BY_ID.has(id) || /^review-\d{4}-\d{2}-\d{2}$/.test(id);
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

export interface VerifyOutcome {
  passed: boolean;
  checks: CheckResult[];
  error?: string;
}

export interface Progress {
  /** False until Clerk has resolved (and, when signed in, progress loaded). */
  ready: boolean;
  /** True when signed in — the only mode with progress. */
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
}

const ProgressContext = createContext<Progress | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded, user } = useUser();

  // Server progress, keyed by user id so a stale user's data never renders.
  const [serverState, setServerState] = useState<{
    forUser: string;
    events: XPEvent[];
  } | null>(null);

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

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user?.id) return;
    const uid = user.id;
    let cancelled = false;
    (async () => {
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
      if (!serverReady || !serverState) return;
      const date = todayKey();
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
    [serverReady, serverState, loadServer],
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

  const value = useMemo<Progress>(() => {
    const events = serverReady ? serverState!.events : [];
    const ready = synced ? serverReady : isLoaded;
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

    const isQuestUnlocked = (questId: string) =>
      isQuestUnlockedFor(doneTaskIds, questId);

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
    };
  }, [synced, serverReady, serverState, isLoaded, toggleTask, submitVerification]);

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
