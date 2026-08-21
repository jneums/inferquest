"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { useProgress } from "@/lib/progress";
import { IconBolt, IconFlame } from "@/components/icons";
import { levelForXP } from "@/lib/levels";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/quests", label: "Quests" },
  { href: "/review", label: "Review" },
  { href: "/achievements", label: "Achievements" },
] as const;

export function Nav() {
  const pathname = usePathname();
  const { ready, synced, xp, streak } = useProgress();
  const level = levelForXP(xp);
  // Stats exist only for signed-in users.
  const showStats = ready && synced;

  return (
    <header className="sticky top-0 z-10 border-b border-[var(--hairline)] bg-[var(--surface-1)]/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-4xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.2em]"
        >
          <IconBolt size={15} className="text-[var(--accent)]" />
          InferQuest
        </Link>
        <nav className="flex gap-1 font-mono text-xs uppercase tracking-wider">
          {LINKS.map((l) => {
            const active =
              l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            const label = l.href === "/" && synced ? "Dashboard" : l.label;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-2.5 py-1 transition-colors ${
                  active
                    ? "bg-[var(--accent-track)] font-medium text-[var(--accent)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-3 text-sm text-[var(--text-secondary)]">
          {showStats && (
            <>
              <span
                title="Current streak"
                className="flex items-center gap-1 text-[var(--amber)]"
              >
                <IconFlame size={14} />
                {streak}
              </span>
              <span
                className="hidden sm:inline"
                title={`Level ${level.n} — ${level.title}`}
              >
                Lv {level.n} · {level.title}
              </span>
            </>
          )}
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="border border-[var(--accent)] px-3 py-1 font-mono text-xs font-medium uppercase tracking-wider text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--on-accent)]">
                Sign in
              </button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </div>
    </header>
  );
}
