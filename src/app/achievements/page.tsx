"use client";

import { useRef } from "react";
import { ACHIEVEMENTS } from "@/data/achievements";
import { useProgress } from "@/lib/progress";
import { Card } from "@/components/ui";

export default function AchievementsPage() {
  const { earnedAchievementIds, exportJSON, importJSON, resetAll } =
    useProgress();
  const fileInput = useRef<HTMLInputElement>(null);

  const download = () => {
    const blob = new Blob([exportJSON()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inferquest-progress.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const onImport = async (file: File | undefined) => {
    if (!file) return;
    const ok = importJSON(await file.text());
    if (!ok) alert("That file doesn't look like an InferQuest export.");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Achievements</h1>
        <p className="mt-1 text-[var(--text-secondary)]">
          {earnedAchievementIds.size} of {ACHIEVEMENTS.length} earned.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {ACHIEVEMENTS.map((a) => {
          const earned = earnedAchievementIds.has(a.id);
          return (
            <Card
              key={a.id}
              className={`flex items-center gap-3 px-4 py-3 ${
                earned ? "" : "opacity-50 grayscale"
              }`}
            >
              <span className="text-3xl" aria-hidden>
                {a.emoji}
              </span>
              <div>
                <div className="font-medium">
                  {a.title}
                  {earned && (
                    <span className="ml-2 text-xs font-normal text-[var(--good-text)]">
                      earned
                    </span>
                  )}
                </div>
                <div className="text-sm text-[var(--text-secondary)]">
                  {a.description}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <section className="space-y-2 border-t border-[var(--hairline)] pt-6">
        <h2 className="text-sm font-medium text-[var(--text-secondary)]">
          Your data
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          Progress lives in this browser’s localStorage. Export it to move
          machines or keep a backup.
        </p>
        <div className="flex flex-wrap gap-2 text-sm">
          <button
            onClick={download}
            className="rounded-md border border-[var(--border)] px-3 py-1.5 hover:border-[var(--baseline)]"
          >
            Export JSON
          </button>
          <button
            onClick={() => fileInput.current?.click()}
            className="rounded-md border border-[var(--border)] px-3 py-1.5 hover:border-[var(--baseline)]"
          >
            Import JSON
          </button>
          <button
            onClick={() => {
              if (confirm("Reset ALL progress? This cannot be undone."))
                resetAll();
            }}
            className="rounded-md border border-[var(--border)] px-3 py-1.5 text-[var(--text-muted)] hover:border-[var(--baseline)]"
          >
            Reset
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => onImport(e.target.files?.[0])}
          />
        </div>
      </section>
    </div>
  );
}
