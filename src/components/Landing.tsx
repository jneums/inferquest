"use client";

import Link from "next/link";
import { SignUpButton, SignInButton } from "@clerk/nextjs";
import { PHASES, QUESTS, TOTAL_XP } from "@/data/curriculum";
import { LEVELS } from "@/lib/levels";
import { FAQ } from "@/lib/seo";
import { IconPlug, IconBolt, IconMerge, IconGrad } from "@/components/icons";
import { Card } from "./ui";

const VERIFIERS = [
  {
    icon: IconPlug,
    title: "Live endpoint probes",
    body: "Deploy an OpenAI-compatible endpoint — your own engine, then production vLLM — and InferQuest probes it for real: streaming framing, usage accounting, max_tokens cutoffs, error shapes, latency targets.",
  },
  {
    icon: IconBolt,
    title: "GPU-graded kernels",
    body: "A local harness grades your attention, KV cache, Triton softmax, tiled matmul, flash attention, quantizer, and ring all-reduce on your own hardware — correctness against references AND measured speed.",
  },
  {
    icon: IconMerge,
    title: "Merged-PR checks",
    body: "The open-source milestones verify against the GitHub API that your PRs into vLLM, SGLang, FlashInfer & co. actually exist, actually merged, and aren't typo fixes.",
  },
  {
    icon: IconGrad,
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
      <section className="pt-8">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.3em] text-[var(--accent)]">
          Fig. 1 — InferQuest, the verified path into LLM serving
        </p>
        <h1 className="mt-5 max-w-2xl text-4xl font-bold uppercase leading-tight tracking-tight sm:text-5xl">
          Become an inference engineer.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--text-secondary)]">
          A free, open inference engineering roadmap from &ldquo;what&rsquo;s a
          KV cache&rdquo; to a signed offer — built from real job-market
          research, with milestones that are{" "}
          <span className="text-[var(--accent)]">verified</span>, not checked
          off.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <SignUpButton mode="modal">
            <button className="bg-[var(--accent)] px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-[var(--on-accent)] hover:bg-[var(--accent-strong)]">
              Start the quest — free
            </button>
          </SignUpButton>
          <Link
            href="/quests"
            className="border border-dashed border-[var(--baseline)] px-5 py-2.5 text-sm font-medium uppercase tracking-wider text-[var(--text-secondary)] hover:border-solid hover:border-[var(--accent)] hover:text-[var(--text-primary)]"
          >
            Browse the quest map
          </Link>
        </div>
        <p className="mt-4 text-xs text-[var(--text-muted)]">
          The full curriculum is open to browse — sign in (free) to track
          progress, take the drills, and unlock the verifiers.
        </p>
      </section>

      {/* What is InferQuest — explicit purpose statement (also required by
          Google OAuth verification: the home page must name the app and
          describe what it does) */}
      <section className="mx-auto max-w-2xl">
        <h2 className="text-xl font-bold">What is InferQuest?</h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
          <strong className="text-[var(--text-primary)]">InferQuest</strong> is
          a free, open, non-commercial web application for learning inference
          engineering — the craft of serving large language models fast and
          cheaply. It organizes a complete curriculum into quests and tasks,
          tracks your progress with XP, levels, and streaks, drills you with
          graded quizzes and spaced-repetition reviews, and automatically
          verifies major milestones like deployed endpoints, GPU kernels, and
          merged open-source pull requests. Signing in (with Google or email)
          is used only to save that progress to your account — see the{" "}
          <a
            href="/privacy"
            className="text-[var(--accent-strong)] underline underline-offset-2"
          >
            privacy policy
          </a>
          .
        </p>
      </section>

      {/* Numbers strip */}
      <section className="grid grid-cols-2 border border-[var(--border)] sm:grid-cols-4">
        {[
          [String(PHASES.length), "phases, bedrock → offer"],
          [String(totalTasks), "tasks across " + QUESTS.length + " quests"],
          [TOTAL_XP.toLocaleString(), "XP to the final level"],
          [String(verifiedCount), "auto-verified milestones"],
        ].map(([n, label], i) => (
          <div
            key={label}
            className={`px-4 py-5 text-center ${i > 0 ? "border-l border-[var(--border)]" : ""} ${i >= 2 ? "border-t border-[var(--border)] sm:border-t-0" : ""}`}
          >
            <div
              className={`text-3xl font-bold ${i === 3 ? "text-[var(--accent)]" : ""}`}
            >
              {n}
            </div>
            <div className="mt-1 text-xs text-[var(--text-muted)]">{label}</div>
          </div>
        ))}
      </section>

      {/* Verifiers */}
      <section>
        <h2 className="text-center text-2xl font-bold tracking-tight">
          Checkboxes are cheap. These aren&rsquo;t checkboxes.
        </h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {VERIFIERS.map((v) => (
            <Card key={v.title} className="px-5 py-4">
              <v.icon size={22} className="text-[var(--accent)]" />
              <h3 className="mt-3 font-bold">{v.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-secondary)]">
                {v.body}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* The journey */}
      <section>
        <h2 className="text-center text-2xl font-bold tracking-tight">
          The journey
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-[var(--text-secondary)]">
          Level up from <strong>{LEVELS[0].title}</strong> to{" "}
          <strong>{LEVELS[LEVELS.length - 1].title}</strong> through ten phases
          — each quest unlocks as its prerequisites near completion.
        </p>
        <ol className="mx-auto mt-6 max-w-2xl">
          {PHASES.map((p, i) => (
            <li key={p.id}>
              <Link href="/quests" className="block">
                <Card
                  className={`flex items-baseline gap-4 px-4 py-2.5 transition-colors hover:border-[var(--accent)] ${i > 0 ? "border-t-0" : ""}`}
                >
                  <span className="w-8 shrink-0 text-right font-mono text-sm text-[var(--accent)]">
                    P{p.number}
                  </span>
                  <span className="font-medium">{p.title}</span>
                  <span className="ml-auto hidden font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] sm:inline">
                    {p.theme}
                  </span>
                </Card>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* FAQ — rendered from the same source as the FAQPage JSON-LD */}
      <section>
        <h2 className="text-center text-2xl font-bold tracking-tight">
          Frequently asked questions
        </h2>
        <div className="mx-auto mt-6 max-w-2xl space-y-3">
          {FAQ.map(({ q, a }) => (
            <details
              key={q}
              className="group border border-[var(--border)] bg-[var(--surface-1)] px-5 py-4"
            >
              <summary className="cursor-pointer list-none font-medium marker:hidden [&::-webkit-details-marker]:hidden">
                <span className="mr-2 inline-block text-[var(--accent)] transition-transform group-open:rotate-90">
                  &gt;
                </span>
                {q}
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                {a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="pb-4 text-center">
        <h2 className="text-2xl font-bold tracking-tight">
          The market pays for proof, not promises.
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-[var(--text-secondary)]">
          Every verified milestone leaves a receipt: probe results, harness
          metrics with your GPU&rsquo;s name on them, merged-PR evidence.
          That&rsquo;s a portfolio, not a certificate.
        </p>
        <div className="mt-6">
          <SignInButton mode="modal">
            <button className="bg-[var(--accent)] px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-[var(--on-accent)] hover:bg-[var(--accent-strong)]">
              Sign in and start earning XP
            </button>
          </SignInButton>
        </div>
      </section>
    </div>
  );
}
