import { assertPublicUrl, fetchWithTimeout, type CheckResult } from "./net";

export interface UrlCheckResult {
  passed: boolean;
  checks: CheckResult[];
  evidence: Record<string, unknown>;
}

/** Strip tags/scripts and collapse whitespace to approximate visible text. */
function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Verifies a published page (blog post, writeup) is live and substantial.
 * Deliberately liberal about platform: any publicly reachable URL counts.
 */
export async function verifyUrl(
  raw: string,
  opts: { mustContainAny?: string[]; minWords?: number } = {},
): Promise<UrlCheckResult> {
  const checks: CheckResult[] = [];
  let url: URL;
  try {
    url = await assertPublicUrl(raw);
  } catch (e) {
    return {
      passed: false,
      checks: [{ name: "public-url", passed: false, detail: e instanceof Error ? e.message : String(e) }],
      evidence: {},
    };
  }
  checks.push({ name: "public-url", passed: true, detail: url.hostname });

  const res = await fetchWithTimeout(url.toString(), {
    timeoutMs: 15_000,
    headers: { "User-Agent": "inferquest-verifier (+https://github.com/jneums/inferquest)" },
  });
  checks.push({
    name: "live",
    passed: res.ok,
    detail: res.ok ? `HTTP ${res.status}` : `HTTP ${res.status} — page must be publicly readable`,
  });
  if (!res.ok) return { passed: false, checks, evidence: { status: res.status } };

  const body = (await res.text()).slice(0, 2_000_000);
  const text = htmlToText(body);
  const words = text.split(" ").filter(Boolean).length;

  const minWords = opts.minWords ?? 400;
  checks.push({
    name: "substantial",
    passed: words >= minWords,
    detail: `${words} words of visible text (need ≥ ${minWords})`,
  });

  if (opts.mustContainAny?.length) {
    const lower = text.toLowerCase();
    const hit = opts.mustContainAny.find((t) => lower.includes(t.toLowerCase()));
    checks.push({
      name: "on-topic",
      passed: Boolean(hit),
      detail: hit
        ? `Mentions “${hit}”`
        : `Should mention one of: ${opts.mustContainAny.join(", ")}`,
    });
  }

  return {
    passed: checks.every((c) => c.passed),
    checks,
    evidence: { url: url.toString(), status: res.status, words },
  };
}
