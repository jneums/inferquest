"use client";

import { useMemo } from "react";
import { todayKey } from "@/lib/progress";

const WEEKS = 26;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Sequential single-hue ramp; thresholds in XP/day. Zero recedes to neutral. */
function heatVar(xp: number): string {
  if (xp <= 0) return "var(--heat-0)";
  if (xp < 50) return "var(--heat-1)";
  if (xp < 120) return "var(--heat-2)";
  if (xp < 250) return "var(--heat-3)";
  return "var(--heat-4)";
}

export function Heatmap({ xpByDay }: { xpByDay: Map<string, number> }) {
  const { weeks, monthLabels } = useMemo(() => {
    // Grid ends on today's week; columns are weeks, rows are Sun–Sat.
    const today = new Date();
    const end = new Date(today);
    end.setDate(end.getDate() + (6 - end.getDay())); // Saturday of this week
    const start = new Date(end);
    start.setDate(start.getDate() - (WEEKS * 7 - 1));

    const weeks: { date: Date; key: string; future: boolean }[][] = [];
    const monthLabels: { col: number; label: string }[] = [];
    const cursor = new Date(start);
    const tKey = todayKey(today);
    for (let w = 0; w < WEEKS; w++) {
      const col: { date: Date; key: string; future: boolean }[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(cursor);
        const key = todayKey(date);
        col.push({ date, key, future: key > tKey });
        if (date.getDate() === 1) {
          monthLabels.push({ col: w, label: MONTHS[date.getMonth()] });
        }
        cursor.setDate(cursor.getDate() + 1);
      }
      weeks.push(col);
    }
    return { weeks, monthLabels };
  }, []);

  return (
    <div className="overflow-x-auto">
      <div className="inline-block">
        <div className="relative mb-1 h-4 text-xs text-[var(--text-muted)]">
          {monthLabels.map((m) => (
            <span
              key={`${m.label}-${m.col}`}
              className="absolute"
              style={{ left: m.col * 15 }}
            >
              {m.label}
            </span>
          ))}
        </div>
        <div className="flex gap-[3px]">
          {weeks.map((col, i) => (
            <div key={i} className="flex flex-col gap-[3px]">
              {col.map((cell) => {
                const xp = xpByDay.get(cell.key) ?? 0;
                return (
                  <div
                    key={cell.key}
                    title={
                      cell.future ? undefined : `${cell.key} — ${xp} XP`
                    }
                    className="h-3 w-3 rounded-[2px]"
                    style={{
                      backgroundColor: cell.future
                        ? "transparent"
                        : heatVar(xp),
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
          Less
          {[0, 30, 80, 150, 300].map((v) => (
            <span
              key={v}
              className="h-3 w-3 rounded-[2px]"
              style={{ backgroundColor: heatVar(v) }}
            />
          ))}
          More
        </div>
      </div>
    </div>
  );
}
