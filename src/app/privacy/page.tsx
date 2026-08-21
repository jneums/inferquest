import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What InferQuest collects, why, and what happens to it. Short version: account basics and your own progress — nothing sold, nothing tracked for ads.",
  alternates: { canonical: "/privacy" },
};

const UPDATED = "August 21, 2026";

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Last updated {UPDATED}
        </p>
      </div>

      <p className="text-[var(--text-secondary)]">
        InferQuest is a free, non-commercial learning platform. The short
        version: we store your account basics and your own learning progress,
        we use them only to run the site, and we don&rsquo;t sell, share for
        advertising, or otherwise monetize anything about you.
      </p>

      <section>
        <h2 className="text-xl font-semibold">What we collect</h2>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-[var(--text-secondary)]">
          <li>
            <strong>Account information.</strong> When you sign in (with
            Google or email), our authentication provider Clerk gives us your
            name, email address, and profile picture. If you use Google
            sign-in, that&rsquo;s all we receive — we never see your password
            or anything else in your Google account.
          </li>
          <li>
            <strong>Learning progress.</strong> Which tasks you&rsquo;ve
            completed, XP earned, quiz and knowledge-check answers, and your
            spaced-repetition review schedule.
          </li>
          <li>
            <strong>Verification submissions.</strong> When you use a
            verifier, we store the evidence needed to mark the milestone
            passed: for endpoint probes, the URL and model name you submitted
            and the probe results — <strong>never your API keys</strong>,
            which are used for the probe and discarded; for GitHub PR checks,
            the public PR URL; for harness submissions, the grading report
            (which includes your GPU model name).
          </li>
        </ul>
        <p className="mt-2 text-[var(--text-secondary)]">
          That&rsquo;s it. There are no analytics trackers, no advertising
          pixels, and no cookies beyond the session cookies Clerk needs to
          keep you signed in.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">How we use it</h2>
        <p className="mt-2 text-[var(--text-secondary)]">
          Solely to operate the site: tracking your progress, scheduling your
          reviews, computing XP and achievements, and verifying milestones.
          Nothing is used for advertising, profiling, or training AI models,
          and nothing is ever sold.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Who processes it</h2>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-[var(--text-secondary)]">
          <li>
            <strong>Clerk</strong> — authentication and session management.
          </li>
          <li>
            <strong>Vercel</strong> — application hosting and the Postgres
            database that stores your progress.
          </li>
          <li>
            <strong>GitHub</strong> — when you submit a pull request for
            verification, we query GitHub&rsquo;s public API about that PR.
          </li>
        </ul>
        <p className="mt-2 text-[var(--text-secondary)]">
          These are processors acting on our behalf; no other third parties
          receive your data.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Deleting your data</h2>
        <p className="mt-2 text-[var(--text-secondary)]">
          You can delete your account from the account menu (top right),
          which removes your authentication data with Clerk. To have your
          progress rows wiped from our database as well — or for any other
          privacy request — open an issue at{" "}
          <a
            href="https://github.com/jneums/inferquest/issues"
            className="text-[var(--accent-strong)] underline underline-offset-2"
          >
            github.com/jneums/inferquest
          </a>{" "}
          and we&rsquo;ll take care of it promptly.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Children</h2>
        <p className="mt-2 text-[var(--text-secondary)]">
          InferQuest is not directed at children under 13, and we don&rsquo;t
          knowingly collect data from them.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Changes</h2>
        <p className="mt-2 text-[var(--text-secondary)]">
          If this policy changes materially, we&rsquo;ll update this page and
          the date above. The history is public in the site&rsquo;s{" "}
          <a
            href="https://github.com/jneums/inferquest"
            className="text-[var(--accent-strong)] underline underline-offset-2"
          >
            source repository
          </a>
          .
        </p>
      </section>
    </article>
  );
}
