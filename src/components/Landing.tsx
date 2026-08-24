"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { SignUpButton, SignInButton } from "@clerk/nextjs";
import {
  PATHS,
  PHASES,
  PHASES_BY_ID,
  QUESTS,
  TOTAL_XP,
  exclusiveQuestsForPathPhase,
} from "@/data/curriculum";
import { LEVELS } from "@/lib/levels";
import { FAQ } from "@/lib/seo";
import { IconPlug, IconBolt, IconMerge, IconGrad } from "@/components/icons";
import { Card } from "./ui";

const VERIFIERS = [
  {
    icon: IconPlug,
    title: "Live endpoint probes",
    body: "Deploy an OpenAI-compatible endpoint (your own engine first, then production vLLM) and InferQuest probes it: streaming framing, usage accounting, max_tokens cutoffs, error shapes, latency targets.",
  },
  {
    icon: IconBolt,
    title: "GPU-graded kernels & training runs",
    body: "A local harness grades your kernels for correctness and measured speed: attention, KV cache, Triton softmax, flash attention, quantizer, ring all-reduce. Training runs get the same treatment — first convergence, a measured ≥1.5× speedup, an adapter fine-tune that keeps its base skills — under fixed token budgets on your own hardware.",
  },
  {
    icon: IconMerge,
    title: "Merged-PR checks",
    body: "The open-source milestones check against the GitHub API that your PRs into vLLM, SGLang, FlashInfer, TRL, torchtitan, nanochat & co. exist, merged, and amount to more than typo fixes.",
  },
  {
    icon: IconGrad,
    title: "Graded interview drills",
    body: "KV-cache sizing math, rooflines, speculative-decoding acceptance, scaling-laws and data-curation calls, parallelism tradeoffs. Graded server-side; the answers never reach your browser.",
  },
];

/** Numbered manual-style section: thick rule, mono index, flush-left heading. */
function Section({
  n,
  title,
  children,
}: {
  n: string;
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="border-t-[3px] border-[var(--ink)] pt-6">
      <div className="font-mono text-xs font-semibold tracking-[0.2em] text-[var(--accent-strong)]">
        {n}
      </div>
      <h2 className="mt-2 max-w-2xl text-2xl font-extrabold tracking-tight sm:text-3xl">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function Landing() {
  const totalTasks = QUESTS.reduce((s, q) => s + q.tasks.length, 0);
  const verifiedCount = QUESTS.reduce(
    (s, q) => s + q.tasks.filter((t) => t.verifier).length,
    0,
  );

  return (
    <div className="space-y-20 sm:space-y-28">
      {/* Hero + numbers strip */}
      <section className="pt-10">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.25em] text-[var(--text-muted)]">
          InferQuest — verified paths into LLM serving and training
        </p>
        <h1 className="mt-5 max-w-3xl text-5xl font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-6xl">
          Serve LLMs. Train LLMs. Prove it
          <span className="text-[var(--accent)]">.</span>
        </h1>
        <p className="mt-7 max-w-xl text-lg leading-relaxed text-[var(--text-secondary)]">
          InferQuest is two free roadmaps, built from a close read of what
          labs currently hire for. One teaches you to{" "}
          <strong className="text-[var(--text-primary)]">serve LLMs</strong>{" "}
          fast and cheap in production. The other teaches you to{" "}
          <strong className="text-[var(--text-primary)]">train them</strong>{" "}
          as well as possible on cheap hardware. You don&rsquo;t check off
          the big milestones yourself; the site{" "}
          <span className="text-[var(--accent-strong)]">verifies</span> them
          against your real endpoints, kernels, and training runs.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-6">
          <SignUpButton mode="modal">
            <button className="bg-[var(--ink)] px-7 py-3.5 font-bold text-[var(--on-ink)] hover:bg-black">
              Start the quest — free
            </button>
          </SignUpButton>
          <Link
            href="/quests"
            className="border-b-2 border-[var(--ink)] pb-0.5 font-medium hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
          >
            Browse the quest map
          </Link>
        </div>
        <p className="mt-5 text-sm text-[var(--text-muted)]">
          The full curriculum is open to browse — sign in (free) to track
          progress, take the drills, and unlock the verifiers.
        </p>

        <div className="mt-16 grid grid-cols-2 gap-x-6 border-t-[3px] border-[var(--ink)] sm:grid-cols-4">
          {[
            [String(PATHS.length), "paths, one shared trunk"],
            [String(totalTasks), "tasks across " + QUESTS.length + " quests"],
            [TOTAL_XP.toLocaleString(), "XP to the final level"],
            [String(verifiedCount), "auto-verified milestones"],
          ].map(([n, label], i) => (
            <div key={label} className="py-5">
              <div
                className={`text-3xl font-extrabold tracking-tight ${i === 3 ? "text-[var(--accent-strong)]" : ""}`}
              >
                {n}
              </div>
              <div className="mt-1 font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 01 — What is InferQuest: explicit purpose statement (also required
          by Google OAuth verification: the home page must name the app and
          describe what it does) */}
      <Section n="01" title="What is InferQuest?">
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)]">
          <strong className="text-[var(--text-primary)]">InferQuest</strong> is
          a free, open, non-commercial web application for learning inference
          engineering and LLM training. It offers two paths — serving large
          language models fast and cheaply, and training them as good as
          possible on minimal hardware — organized into quests and tasks. It
          tracks your progress with XP, levels, and streaks, drills you with
          graded quizzes and spaced-repetition reviews, and automatically
          verifies major milestones like deployed endpoints, GPU kernels,
          training runs, and merged open-source pull requests.
        </p>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)]">
          <strong className="text-[var(--text-primary)]">Who it&rsquo;s for:</strong>{" "}
          working software engineers who want to move into ML systems. You
          should be comfortable programming (Python in particular), and you
          should have seen a training loop at some point, because terms like
          training loss and overfitting show up early without much
          introduction. PyTorch and the matrix math get refreshed along the
          way, but nothing here teaches programming itself. If you&rsquo;re
          starting from nothing, do Karpathy&rsquo;s{" "}
          <a
            href="https://karpathy.ai/zero-to-hero.html"
            target="_blank"
            rel="noreferrer"
            className="text-[var(--accent-strong)] underline underline-offset-2"
          >
            Neural Networks: Zero to Hero
          </a>{" "}
          first and come back.
        </p>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)]">
          Signing in (with Google or email) is used only to save that progress
          to your account — see the{" "}
          <a
            href="/privacy"
            className="text-[var(--accent-strong)] underline underline-offset-2"
          >
            privacy policy
          </a>
          .
        </p>
      </Section>

      {/* 02 — Verifiers */}
      <Section
        n="02"
        title={<>What &ldquo;verified&rdquo; means here</>}
      >
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {VERIFIERS.map((v) => (
            <Card
              key={v.title}
              className="border-t-[3px] border-t-[var(--ink)] px-6 py-5"
            >
              <v.icon size={22} className="text-[var(--accent-strong)]" />
              <h3 className="mt-3 text-lg font-bold">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                {v.body}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      {/* 03 — The journey: Foundations trunk, then the two paths */}
      <Section n="03" title="One trunk, two paths">
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)]">
          Everyone starts in <strong>Foundations</strong> (transformer
          internals, GPU architecture, kernels), then branches. XP and levels
          are shared: one ladder from <strong>{LEVELS[0].title}</strong> to{" "}
          <strong>{LEVELS[LEVELS.length - 1].title}</strong>, whichever path
          you walk. The titles <strong>Inference Engineer</strong> and{" "}
          <strong>Training Engineer</strong> are earned separately, as
          certificates for finishing a path.
        </p>
        <div className="mt-8 max-w-2xl">
          <div className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
            Foundations — counts for both paths
          </div>
          <ol className="mt-3">
            {PHASES.filter((p) => p.section === "foundations").map((p, i) => (
              <li key={p.id}>
                <Link href="/quests" className="block">
                  <Card
                    className={`flex items-baseline gap-4 px-4 py-2.5 transition-colors hover:border-[var(--accent)] ${i > 0 ? "border-t-0" : ""}`}
                  >
                    <span className="w-8 shrink-0 text-right text-lg font-extrabold tracking-tight text-[var(--border)]">
                      {String(p.number).padStart(2, "0")}
                    </span>
                    <span className="font-medium">{p.title}</span>
                    <span className="ml-auto hidden font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)] sm:inline">
                      {p.theme}
                    </span>
                  </Card>
                </Link>
              </li>
            ))}
          </ol>
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {PATHS.map((path) => (
            <div key={path.id}>
              <div className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                {path.title}
              </div>
              <ol className="mt-3">
                {path.phaseIds
                  .filter((pid) => exclusiveQuestsForPathPhase(path.id, pid).length > 0)
                  .map((phaseId, i) => {
                    const p = PHASES_BY_ID.get(phaseId);
                    if (!p) return null;
                    return (
                      <li key={`${path.id}-${phaseId}`}>
                        <Link href="/quests" className="block">
                          <Card
                            className={`flex items-baseline gap-4 px-4 py-2.5 transition-colors hover:border-[var(--accent)] ${i > 0 ? "border-t-0" : ""}`}
                          >
                            <span className="w-8 shrink-0 text-right text-lg font-extrabold tracking-tight text-[var(--border)]">
                              {String(p.number).padStart(2, "0")}
                            </span>
                            <span className="font-medium">{p.title}</span>
                            <span className="ml-auto hidden font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)] sm:inline">
                              {p.theme}
                            </span>
                          </Card>
                        </Link>
                      </li>
                    );
                  })}
              </ol>
            </div>
          ))}
        </div>
      </Section>

      {/* 04 — FAQ, rendered from the same source as the FAQPage JSON-LD */}
      <Section n="04" title="Frequently asked questions">
        <div className="mt-8 max-w-2xl space-y-4">
          {FAQ.map(({ q, a }) => (
            <details
              key={q}
              className="group border border-[var(--border)] bg-[var(--surface-1)] px-5 py-4"
            >
              <summary className="cursor-pointer list-none font-medium marker:hidden [&::-webkit-details-marker]:hidden">
                <span
                  aria-hidden
                  className="mr-2.5 inline-block h-2.5 w-2.5 bg-[var(--accent)] transition-transform group-open:rotate-45"
                />
                {q}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                {a}
              </p>
            </details>
          ))}
        </div>
      </Section>

      {/* Closing CTA */}
      <section className="border-t-[3px] border-[var(--ink)] pb-6 pt-10">
        <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight">
          Walk into the interview with receipts.
        </h2>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--text-secondary)]">
          Every verified milestone leaves a receipt: probe results, harness
          metrics with your GPU&rsquo;s name on them, merged PRs anyone can
          look up. By the end you have a portfolio a hiring team can check
          for themselves.
        </p>
        <div className="mt-8">
          <SignInButton mode="modal">
            <button className="bg-[var(--ink)] px-7 py-3.5 font-bold text-[var(--on-ink)] hover:bg-black">
              Sign in and start earning XP
            </button>
          </SignInButton>
        </div>
      </section>
    </div>
  );
}
