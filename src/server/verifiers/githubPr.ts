import { fetchWithTimeout, type CheckResult } from "./net";

export interface GithubPrResult {
  passed: boolean;
  checks: CheckResult[];
  evidence: Record<string, unknown>;
}

const PR_URL = /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)\/pull\/(\d+)\/?$/;

/**
 * Verifies a GitHub PR is real, merged, and non-trivial via the public API.
 * Honest by construction: the PR's merged state lives on GitHub, not in the
 * submission. (We don't verify authorship — the point is proof the work
 * exists; pass GITHUB_TOKEN to raise the rate limit, not for auth.)
 */
export async function verifyGithubPr(
  prUrl: string,
  repoAllowlist?: string[],
): Promise<GithubPrResult> {
  const checks: CheckResult[] = [];
  const m = PR_URL.exec(prUrl.trim());
  if (!m) {
    return {
      passed: false,
      checks: [
        {
          name: "url-format",
          passed: false,
          detail: "Expected https://github.com/<owner>/<repo>/pull/<number>",
        },
      ],
      evidence: {},
    };
  }
  const [, owner, repo, num] = m;
  const slug = `${owner}/${repo}`.toLowerCase();

  if (repoAllowlist?.length) {
    const ok = repoAllowlist.some((r) => r.toLowerCase() === slug);
    checks.push({
      name: "target-repo",
      passed: ok,
      detail: ok
        ? `${slug} is an accepted repo`
        : `${slug} is not one of: ${repoAllowlist.join(", ")}`,
    });
    if (!ok) return { passed: false, checks, evidence: { slug } };
  }

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "inferquest-verifier",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetchWithTimeout(
    `https://api.github.com/repos/${owner}/${repo}/pulls/${num}`,
    { headers, timeoutMs: 10_000 },
  );
  if (res.status === 404) {
    checks.push({ name: "pr-exists", passed: false, detail: "PR not found (or repo is private)." });
    return { passed: false, checks, evidence: {} };
  }
  if (!res.ok) {
    checks.push({
      name: "pr-exists",
      passed: false,
      detail: `GitHub API returned ${res.status} — try again shortly.`,
    });
    return { passed: false, checks, evidence: {} };
  }
  const pr = (await res.json()) as {
    title: string;
    merged: boolean;
    merged_at: string | null;
    additions: number;
    deletions: number;
    changed_files: number;
    user?: { login?: string };
    html_url: string;
  };

  checks.push({ name: "pr-exists", passed: true, detail: `Found: “${pr.title}”` });
  checks.push({
    name: "merged",
    passed: pr.merged,
    detail: pr.merged
      ? `Merged at ${pr.merged_at}`
      : "PR is not merged — come back when it lands.",
  });
  const substantial = pr.additions + pr.deletions >= 3;
  checks.push({
    name: "non-trivial",
    passed: substantial,
    detail: `${pr.additions}+ / ${pr.deletions}− across ${pr.changed_files} file(s)`,
  });

  return {
    passed: checks.every((c) => c.passed),
    checks,
    evidence: {
      repo: slug,
      number: Number(num),
      title: pr.title,
      author: pr.user?.login,
      mergedAt: pr.merged_at,
      additions: pr.additions,
      deletions: pr.deletions,
      changedFiles: pr.changed_files,
      url: pr.html_url,
    },
  };
}
