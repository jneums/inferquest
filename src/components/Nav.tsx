"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { useProgress } from "@/lib/progress";
import { levelForXP } from "@/lib/levels";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/quests", label: "Quests" },
  { href: "/achievements", label: "Achievements" },
] as const;

export function Nav() {
  const pathname = usePathname();
  const { ready, xp, streak } = useProgress();
  const level = levelForXP(xp);

  return (
    <header className="sticky top-0 z-10 border-b border-[var(--hairline)] bg-[var(--surface-1)]/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-4xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="text-base font-semibold tracking-tight">
          ⚡ InferQuest
        </Link>
        <nav className="flex gap-1 text-sm">
          {LINKS.map((l) => {
            const active =
              l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-md px-2.5 py-1 transition-colors ${
                  active
                    ? "bg-[var(--accent-track)] font-medium text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-3 text-sm text-[var(--text-secondary)]">
          {ready && (
            <>
              <span title="Current streak">🔥 {streak}</span>
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
              <button className="rounded-md bg-[var(--accent)] px-3 py-1 text-sm font-medium text-white hover:bg-[var(--accent-strong)]">
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
