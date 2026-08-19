"use client";

import { useEffect, useState } from "react";
import { SignInButton } from "@clerk/nextjs";
import { useProgress, type VerifyOutcome } from "@/lib/progress";
import type { Task, Verifier } from "@/lib/types";
import type { CheckResult } from "@/server/verifiers/net";

function CheckList({ checks }: { checks: CheckResult[] }) {
  return (
    <ul className="mt-3 space-y-1.5">
      {checks.map((c, i) => (
        <li key={i} className="flex gap-2 text-sm">
          <span aria-hidden>{c.passed ? "✅" : "❌"}</span>
          <span>
            <span className="font-medium">{c.name}</span>{" "}
            <span className="text-[var(--text-secondary)]">— {c.detail}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block text-sm">
      <span className="text-[var(--text-secondary)]">{label}</span>
      <input
        {...props}
        className="mt-1 w-full rounded-md border border-[var(--border)] bg-transparent px-2.5 py-1.5 font-mono text-sm outline-none focus:border-[var(--accent)]"
      />
    </label>
  );
}

function SubmitButton({ busy, label }: { busy: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--accent-strong)] disabled:opacity-50"
    >
      {busy ? "Verifying…" : label}
    </button>
  );
}

function EndpointForm({
  task,
  verifier,
  onResult,
}: {
  task: Task;
  verifier: Extract<Verifier, { type: "endpoint" }>;
  onResult: (r: VerifyOutcome) => void;
}) {
  const { submitVerification } = useProgress();
  const [url, setUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        onResult(
          await submitVerification(task.id, {
            url,
            apiKey: apiKey || undefined,
            model: model || undefined,
          }),
        );
        setBusy(false);
      }}
    >
      <p className="text-sm text-[var(--text-secondary)]">
        {verifier.suite === "openai-compat"
          ? "Point the verifier at your publicly reachable endpoint. It will probe /v1/models, run non-streaming and streaming chat completions, test max_tokens cutoff, usage accounting, SSE framing, and error shapes."
          : `The verifier streams real completions and measures the median of 3 runs.${verifier.thresholds?.ttftMsMax ? ` TTFT must be ≤ ${verifier.thresholds.ttftMsMax}ms.` : ""}${verifier.thresholds?.tokensPerSecMin ? ` Decode must be ≥ ${verifier.thresholds.tokensPerSecMin} tok/s.` : ""}`}
      </p>
      <Field
        label="Endpoint base URL (e.g. https://llm.example.com or …/v1)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://"
        required
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="API key (optional — used for the probe, never stored)"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          type="password"
          autoComplete="off"
        />
        <Field
          label="Model id (optional — defaults to first served model)"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        />
      </div>
      <SubmitButton busy={busy} label="Run conformance suite" />
    </form>
  );
}

function SingleUrlForm({
  task,
  field,
  buttonLabel,
  hint,
  onResult,
}: {
  task: Task;
  field: "prUrl" | "url";
  buttonLabel: string;
  hint: string;
  onResult: (r: VerifyOutcome) => void;
}) {
  const { submitVerification } = useProgress();
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        onResult(await submitVerification(task.id, { [field]: value }));
        setBusy(false);
      }}
    >
      <p className="text-sm text-[var(--text-secondary)]">{hint}</p>
      <Field
        label={field === "prUrl" ? "Pull request URL" : "Published URL"}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="https://"
        required
      />
      <SubmitButton busy={busy} label={buttonLabel} />
    </form>
  );
}

function HarnessForm({
  task,
  verifier,
  onResult,
}: {
  task: Task;
  verifier: Extract<Verifier, { type: "harness" }>;
  onResult: (r: VerifyOutcome) => void;
}) {
  const { submitVerification } = useProgress();
  const [report, setReport] = useState("");
  const [busy, setBusy] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setParseError(null);
        let parsed: unknown;
        try {
          parsed = JSON.parse(report);
        } catch {
          setParseError("That isn't valid JSON — paste the harness output verbatim.");
          return;
        }
        setBusy(true);
        onResult(await submitVerification(task.id, parsed));
        setBusy(false);
      }}
    >
      <p className="text-sm text-[var(--text-secondary)]">
        Run the grader on a machine with a GPU, then paste the JSON report it
        prints:
      </p>
      <pre className="overflow-x-auto rounded-md bg-[var(--accent-track)] px-3 py-2 font-mono text-xs">
        python harness/run.py {verifier.script}
      </pre>
      <label className="block text-sm">
        <span className="text-[var(--text-secondary)]">Harness report JSON</span>
        <textarea
          value={report}
          onChange={(e) => setReport(e.target.value)}
          required
          rows={5}
          className="mt-1 w-full rounded-md border border-[var(--border)] bg-transparent px-2.5 py-1.5 font-mono text-xs outline-none focus:border-[var(--accent)]"
          placeholder='{"harness_version": "1", "task_id": "…", …}'
        />
      </label>
      {parseError && <p className="text-sm text-[#d03b3b]">{parseError}</p>}
      <SubmitButton busy={busy} label="Submit report" />
    </form>
  );
}

interface QuizData {
  title: string;
  questions: Array<{ prompt: string; choices: string[] }>;
}

function QuizForm({
  task,
  verifier,
  onResult,
}: {
  task: Task;
  verifier: Extract<Verifier, { type: "quiz" }>;
  onResult: (r: VerifyOutcome) => void;
}) {
  const { submitVerification } = useProgress();
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/quiz/${verifier.quizId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((q) => {
        if (!cancelled) setQuiz(q);
      });
    return () => {
      cancelled = true;
    };
  }, [verifier.quizId]);

  if (!quiz) {
    return <p className="text-sm text-[var(--text-muted)]">Loading quiz…</p>;
  }

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        onResult(
          await submitVerification(task.id, {
            answers: quiz.questions.map((_, i) => answers[i] ?? -1),
          }),
        );
        setBusy(false);
      }}
    >
      <p className="text-sm text-[var(--text-secondary)]">
        {quiz.title} — {quiz.questions.length} questions, {verifier.passPct}% to
        pass. Graded server-side.
      </p>
      {quiz.questions.map((q, qi) => (
        <fieldset key={qi} className="space-y-1.5">
          <legend className="text-sm font-medium">
            {qi + 1}. {q.prompt}
          </legend>
          {q.choices.map((choice, ci) => (
            <label key={ci} className="flex items-start gap-2 text-sm">
              <input
                type="radio"
                name={`q-${task.id}-${qi}`}
                checked={answers[qi] === ci}
                onChange={() => setAnswers((a) => ({ ...a, [qi]: ci }))}
                required
                className="mt-1 accent-[var(--accent)]"
              />
              <span className="text-[var(--text-secondary)]">{choice}</span>
            </label>
          ))}
        </fieldset>
      ))}
      <SubmitButton busy={busy} label="Submit answers" />
    </form>
  );
}

export function VerifyPanel({ task }: { task: Task }) {
  const { synced, doneTaskIds } = useProgress();
  const [result, setResult] = useState<VerifyOutcome | null>(null);
  const verifier = task.verifier!;
  const done = doneTaskIds.has(task.id);

  if (done) {
    return (
      <p className="mt-2 text-sm text-[var(--good-text)]">
        ✅ Verified{result?.checks?.length ? " — checks passed" : ""}
      </p>
    );
  }

  if (!synced) {
    return (
      <div className="mt-2 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
        <span aria-hidden>🛡️</span>
        This task is completed by automated verification —
        <SignInButton mode="modal">
          <button className="font-medium text-[var(--accent-strong)] underline underline-offset-2">
            sign in to submit
          </button>
        </SignInButton>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-[var(--hairline)] bg-[var(--page)] p-3">
      {verifier.type === "endpoint" && (
        <EndpointForm task={task} verifier={verifier} onResult={setResult} />
      )}
      {verifier.type === "github-pr" && (
        <SingleUrlForm
          task={task}
          field="prUrl"
          buttonLabel="Verify PR"
          hint={`The verifier checks the PR exists, is merged, and is non-trivial${verifier.repoAllowlist?.length ? ` — accepted repos: ${verifier.repoAllowlist.join(", ")}` : ""}.`}
          onResult={setResult}
        />
      )}
      {verifier.type === "url" && (
        <SingleUrlForm
          task={task}
          field="url"
          buttonLabel="Verify post"
          hint="The verifier checks the page is publicly reachable, substantial, and on-topic."
          onResult={setResult}
        />
      )}
      {verifier.type === "harness" && (
        <HarnessForm task={task} verifier={verifier} onResult={setResult} />
      )}
      {verifier.type === "quiz" && (
        <QuizForm task={task} verifier={verifier} onResult={setResult} />
      )}

      {result && (
        <div className="mt-3 border-t border-[var(--hairline)] pt-3">
          <p className={`text-sm font-medium ${result.passed ? "text-[var(--good-text)]" : ""}`}>
            {result.passed
              ? `✅ Passed — +${task.xp} XP`
              : result.error
                ? `⚠️ ${result.error}`
                : "❌ Not yet — fix the failing checks and rerun"}
          </p>
          {result.checks.length > 0 && <CheckList checks={result.checks} />}
        </div>
      )}
    </div>
  );
}
