"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { useProgress } from "@/lib/progress";
import { IconFlame } from "@/components/icons";
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
    <header className="sticky top-0 z-10 border-b-[3px] border-[var(--ink)] bg-[var(--page)]/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-extrabold tracking-tight"
        >
          <span aria-hidden className="h-3 w-3 bg-[var(--accent)]" />
          InferQuest
        </Link>
        <nav className="order-last -mx-2 w-full flex gap-1 text-sm font-medium sm:order-none sm:mx-0 sm:w-auto">
          {LINKS.map((l) => {
            const active =
              l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            const label = l.href === "/" && synced ? "Dashboard" : l.label;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-2 py-1 transition-colors sm:px-2.5 ${
                  active
                    ? "font-bold text-[var(--text-primary)] underline decoration-[var(--accent)] decoration-2 underline-offset-4"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
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
                className="flex items-center gap-1 font-mono text-[var(--accent-strong)]"
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
              <button className="bg-[var(--ink)] px-3.5 py-1.5 text-sm font-bold text-[var(--on-ink)] hover:bg-black">
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
