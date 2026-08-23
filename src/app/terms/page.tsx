import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms for using InferQuest: a free, open, as-is learning platform for LLM inference and training engineering.",
  alternates: { canonical: "/terms" },
};

const UPDATED = "August 21, 2026";

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Terms of Service
        </h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Last updated {UPDATED}
        </p>
      </div>

      <p className="text-[var(--text-secondary)]">
        InferQuest is a free, non-commercial learning platform. By using it
        you agree to these terms — they&rsquo;re short and there&rsquo;s no
        fine print.
      </p>

      <section>
        <h2 className="text-xl font-semibold">The service</h2>
        <p className="mt-2 text-[var(--text-secondary)]">
          InferQuest provides a curriculum, progress tracking, quizzes, and
          automated verification of learning milestones. It&rsquo;s free, and
          we intend to keep it that way. It is provided{" "}
          <strong>as is, without warranty of any kind</strong> — we make no
          guarantees about availability, accuracy of the material, or that
          completing the curriculum leads to any particular outcome (like a
          job offer — the final quest is aspirational, not a promise).
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Your account and conduct</h2>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-[var(--text-secondary)]">
          <li>Keep your account credentials to yourself.</li>
          <li>
            Don&rsquo;t abuse the verifiers: submit your own work, don&rsquo;t
            point endpoint probes at systems you don&rsquo;t control or
            aren&rsquo;t authorized to test, and don&rsquo;t attempt to
            disrupt the service or other users.
          </li>
          <li>
            We may suspend accounts that abuse the service, and we may modify
            or discontinue features (or the service) at any time.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Content and links</h2>
        <p className="mt-2 text-[var(--text-secondary)]">
          The curriculum links extensively to third-party resources (papers,
          videos, courses, documentation). Those belong to their respective
          authors, aren&rsquo;t affiliated with InferQuest, and are governed
          by their own terms. Work you produce while following the curriculum
          — your code, your kernels, your PRs — is yours.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Liability</h2>
        <p className="mt-2 text-[var(--text-secondary)]">
          To the maximum extent permitted by law, InferQuest and its
          maintainers are not liable for any damages arising from your use of
          the service. Some curriculum tasks involve running code on your own
          hardware — that&rsquo;s at your own risk.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Privacy</h2>
        <p className="mt-2 text-[var(--text-secondary)]">
          How we handle your data is covered by the{" "}
          <a
            href="/privacy"
            className="text-[var(--accent-strong)] underline underline-offset-2"
          >
            Privacy Policy
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Contact</h2>
        <p className="mt-2 text-[var(--text-secondary)]">
          Questions or problems: open an issue at{" "}
          <a
            href="https://github.com/jneums/inferquest/issues"
            className="text-[var(--accent-strong)] underline underline-offset-2"
          >
            github.com/jneums/inferquest
          </a>
          .
        </p>
      </section>
    </article>
  );
}
