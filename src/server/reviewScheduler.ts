/**
 * SM-2-lite spaced-repetition scheduling. Pure functions — tested directly.
 *
 * New cards are due immediately. Intervals: first correct → 1 day, second →
 * 3 days, then interval × ease. Wrong answers reset the interval to 1 day
 * and dent the ease. Ease lives in [1.3, 2.8].
 */
export interface ReviewState {
  intervalDays: number;
  ease: number;
  reps: number;
  lapses: number;
}

export const NEW_CARD: ReviewState = { intervalDays: 0, ease: 2.5, reps: 0, lapses: 0 };

export function schedule(prev: ReviewState, correct: boolean): ReviewState & { dueInDays: number } {
  if (!correct) {
    const next = {
      intervalDays: 1,
      ease: Math.max(1.3, prev.ease - 0.3),
      reps: 0,
      lapses: prev.lapses + 1,
    };
    return { ...next, dueInDays: next.intervalDays };
  }
  const intervalDays =
    prev.reps === 0 ? 1 : prev.reps === 1 ? 3 : Math.round(prev.intervalDays * prev.ease * 10) / 10;
  const next = {
    intervalDays,
    ease: Math.min(2.8, prev.ease + 0.05),
    reps: prev.reps + 1,
    lapses: prev.lapses,
  };
  return { ...next, dueInDays: next.intervalDays };
}
