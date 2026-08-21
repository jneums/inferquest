"use client";

import Link from "next/link";
import { SignUpButton, SignInButton } from "@clerk/nextjs";
import { PHASES, QUESTS, TOTAL_XP } from "@/data/curriculum";
import { LEVELS } from "@/lib/levels";
import { Card } from "./ui";

const VERIFIERS = [
  {
    emoji: "🔌",
    title: "Live endpoint probes",
    body: "Deploy an OpenAI-compatible endpoint — your own engine, then production vLLM — and InferQuest probes it for real: streaming framing, usage accounting, max_tokens cutoffs, error shapes, latency targets.",
  },
  {
    emoji: "⚡",
    title: "GPU-graded kernels",
    body: "A local harness grades your attention, KV cache, Triton softmax, tiled matmul, flash attention, quantizer, and ring all-reduce on your own hardware — correctness against references AND measured speed.",
  },
  {
    emoji: "🔮",
    title: "Merged-PR checks",
    body: "The open-source milestones verify against the GitHub API that your PRs into vLLM, SGLang, FlashInfer & co. actually exist, actually merged, and aren't typo fixes.",
  },
  {
    emoji: "🎓",
    title: "Graded interview drills",
    body: "KV-cache sizing math, rooflines, speculative-decoding acceptance, parallelism tradeoffs — graded server-side, answers never shipped to your browser.",
  },
];

export function Landing() {
  const totalTasks = QUESTS.reduce((s, q) => s + q.tasks.length, 0);
  const verifiedCount = QUESTS.reduce(
    (s, q) => s + q.tasks.filter((t) => t.verifier).length,
    0,
  );

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="pt-8 text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-[var(--accent-strong)]">
          The verified path into LLM serving
        </p>
        <h1 className="mx-auto mt-3 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Become an inference engineer.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-[var(--text-secondary)]">
          A free, open curriculum from “what&rsquo;s a KV cache” to a signed
          offer — built from real job-market research, with milestones that are{" "}
          <em>verified</em>, not checked off.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <SignUpButton mode="modal">
            <button className="rounded-lg bg-[var(--accent)] px-5 py-2.5 font-medium text-white hover:bg-[var(--accent-strong)]">
              Start the quest — free
            </button>
          </SignUpButton>
          <Link
            href="/quests"
            className="rounded-lg border border-[var(--border)] px-5 py-2.5 font-medium hover:border-[var(--baseline)]"
          >
            Browse the quest map
          </Link>
        </div>
        <p className="mt-3 text-xs text-[var(--text-muted)]">
          The full curriculum is open to browse — sign in (free) to track
          progress, take the drills, and unlock the verifiers.
        </p>
      </section>

      {/* Numbers strip */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          [String(PHASES.length), "phases, bedrock → offer"],
          [String(totalTasks), "tasks across " + QUESTS.length + " quests"],
          [TOTAL_XP.toLocaleString(), "XP to the final level"],
          [String(verifiedCount), "auto-verified milestones"],
        ].map(([n, label]) => (
          <Card key={label} className="px-4 py-4 text-center">
            <div className="text-3xl font-semibold">{n}</div>
            <div className="mt-1 text-xs text-[var(--text-secondary)]">{label}</div>
          </Card>
        ))}
      </section>

      {/* Verifiers */}
      <section>
        <h2 className="text-center text-2xl font-semibold tracking-tight">
          Checkboxes are cheap. These aren&rsquo;t checkboxes.
        </h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {VERIFIERS.map((v) => (
            <Card key={v.title} className="px-5 py-4">
              <div className="text-2xl" aria-hidden>
                {v.emoji}
              </div>
              <h3 className="mt-2 font-medium">{v.title}</h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{v.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* The journey */}
      <section>
        <h2 className="text-center text-2xl font-semibold tracking-tight">
          The journey
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-[var(--text-secondary)]">
          Level up from <strong>{LEVELS[0].title}</strong> to{" "}
          <strong>{LEVELS[LEVELS.length - 1].title}</strong> through ten phases
          — each quest unlocks as its prerequisites near completion.
        </p>
        <ol className="mx-auto mt-6 max-w-2xl space-y-2">
          {PHASES.map((p) => (
            <li key={p.id}>
              <Link href="/quests" className="block">
                <Card className="flex items-baseline gap-3 px-4 py-2.5 transition-colors hover:border-[var(--baseline)]">
                  <span className="w-6 shrink-0 text-right font-mono text-sm text-[var(--text-muted)]">
                    {p.number}
                  </span>
                  <span className="font-medium">{p.title}</span>
                  <span className="ml-auto hidden text-xs text-[var(--text-muted)] sm:inline">
                    {p.theme}
                  </span>
                </Card>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* Closing CTA */}
      <section className="pb-4 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          The market pays for proof, not promises.
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-[var(--text-secondary)]">
          Every verified milestone leaves a receipt: probe results, harness
          metrics with your GPU&rsquo;s name on them, merged-PR evidence.
          That&rsquo;s a portfolio, not a certificate.
        </p>
        <div className="mt-6">
          <SignInButton mode="modal">
            <button className="rounded-lg bg-[var(--accent)] px-5 py-2.5 font-medium text-white hover:bg-[var(--accent-strong)]">
              Sign in and start earning XP
            </button>
          </SignInButton>
        </div>
      </section>
    </div>
  );
}
