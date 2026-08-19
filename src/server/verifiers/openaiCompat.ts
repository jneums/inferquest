import { assertPublicUrl, fetchWithTimeout, type CheckResult } from "./net";

export interface EndpointResult {
  passed: boolean;
  checks: CheckResult[];
  evidence: Record<string, unknown>;
}

interface ProbeTarget {
  base: string; // normalized, ends with /v1
  headers: Record<string, string>;
  model: string;
}

function normalizeBase(raw: string): string {
  let base = raw.trim().replace(/\/+$/, "");
  if (base.endsWith("/v1")) base = base.slice(0, -3).replace(/\/+$/, "");
  return `${base}/v1`;
}

async function json<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

interface ChatCompletion {
  id?: string;
  object?: string;
  created?: number;
  model?: string;
  choices?: Array<{
    index?: number;
    message?: { role?: string; content?: string | null };
    finish_reason?: string | null;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

async function resolveTarget(
  rawUrl: string,
  apiKey: string | undefined,
  modelHint: string | undefined,
  checks: CheckResult[],
): Promise<ProbeTarget | null> {
  await assertPublicUrl(rawUrl);
  const base = normalizeBase(rawUrl);
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

  // ── GET /v1/models ──
  const res = await fetchWithTimeout(`${base}/models`, { headers, timeoutMs: 15_000 });
  const body = await json<{ object?: string; data?: Array<{ id?: string; object?: string }> }>(res);
  const listOk =
    res.ok &&
    body?.object === "list" &&
    Array.isArray(body.data) &&
    body.data.length > 0 &&
    body.data.every((m) => typeof m.id === "string" && m.object === "model");
  checks.push({
    name: "GET /v1/models",
    passed: listOk,
    detail: listOk
      ? `object="list" with ${body!.data!.length} model(s): ${body!.data!.slice(0, 3).map((m) => m.id).join(", ")}`
      : `Expected 200 with {object:"list", data:[{id, object:"model"}…]} — got HTTP ${res.status}${body?.object ? `, object="${body.object}"` : ""}`,
  });
  if (!listOk) return null;

  const model = modelHint?.trim() || body!.data![0].id!;
  return { base, headers, model };
}

async function checkNonStreaming(t: ProbeTarget, checks: CheckResult[]): Promise<boolean> {
  const res = await fetchWithTimeout(`${t.base}/chat/completions`, {
    method: "POST",
    headers: t.headers,
    timeoutMs: 30_000,
    body: JSON.stringify({
      model: t.model,
      messages: [{ role: "user", content: "Reply with exactly one short sentence." }],
      max_tokens: 64,
      temperature: 0,
    }),
  });
  const body = await json<ChatCompletion>(res);
  const c = body?.choices?.[0];

  const shapeOk =
    res.ok &&
    typeof body?.id === "string" &&
    body.object === "chat.completion" &&
    typeof body.created === "number" &&
    typeof body.model === "string" &&
    Array.isArray(body.choices) &&
    c?.index === 0 &&
    c.message?.role === "assistant" &&
    typeof c.message.content === "string" &&
    c.message.content.length > 0 &&
    typeof c.finish_reason === "string";
  checks.push({
    name: "POST /v1/chat/completions",
    passed: shapeOk,
    detail: shapeOk
      ? `object="chat.completion", assistant replied ${c!.message!.content!.length} chars, finish_reason="${c!.finish_reason}"`
      : `HTTP ${res.status} — response must have id, object="chat.completion", created, model, choices[0].{index, message.{role:"assistant", content}, finish_reason}`,
  });

  const u = body?.usage;
  const usageOk =
    Boolean(u) &&
    typeof u!.prompt_tokens === "number" &&
    u!.prompt_tokens > 0 &&
    typeof u!.completion_tokens === "number" &&
    u!.completion_tokens > 0 &&
    u!.total_tokens === u!.prompt_tokens + u!.completion_tokens;
  checks.push({
    name: "usage accounting",
    passed: usageOk,
    detail: usageOk
      ? `prompt=${u!.prompt_tokens}, completion=${u!.completion_tokens}, total=${u!.total_tokens}`
      : "usage must report prompt_tokens, completion_tokens, and total_tokens = their sum",
  });
  return shapeOk && usageOk;
}

async function checkMaxTokens(t: ProbeTarget, checks: CheckResult[]): Promise<boolean> {
  const res = await fetchWithTimeout(`${t.base}/chat/completions`, {
    method: "POST",
    headers: t.headers,
    timeoutMs: 30_000,
    body: JSON.stringify({
      model: t.model,
      messages: [{ role: "user", content: "Count upward from 1, one number per line, without stopping." }],
      max_tokens: 8,
      temperature: 0,
    }),
  });
  const body = await json<ChatCompletion>(res);
  const finish = body?.choices?.[0]?.finish_reason;
  const completion = body?.usage?.completion_tokens ?? Infinity;
  const ok = res.ok && finish === "length" && completion <= 10;
  checks.push({
    name: "max_tokens cutoff",
    passed: ok,
    detail: ok
      ? `Truncated at ${completion} tokens with finish_reason="length"`
      : `With max_tokens=8 the reply must stop early with finish_reason="length" (got finish_reason="${finish}", completion_tokens=${body?.usage?.completion_tokens})`,
  });
  return ok;
}

interface StreamStats {
  ttftMs: number;
  contentChunks: number;
  tokensPerSec: number | null;
  completionTokens: number | null;
  problems: string[];
  sawRole: boolean;
  sawFinish: boolean;
  sawDone: boolean;
  contentType: string;
}

async function runStream(
  t: ProbeTarget,
  prompt: string,
  maxTokens: number,
): Promise<StreamStats> {
  const started = Date.now();
  const res = await fetchWithTimeout(`${t.base}/chat/completions`, {
    method: "POST",
    headers: t.headers,
    timeoutMs: 60_000,
    body: JSON.stringify({
      model: t.model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature: 0,
      stream: true,
      stream_options: { include_usage: true },
    }),
  });
  const stats: StreamStats = {
    ttftMs: -1,
    contentChunks: 0,
    tokensPerSec: null,
    completionTokens: null,
    problems: [],
    sawRole: false,
    sawFinish: false,
    sawDone: false,
    contentType: res.headers.get("content-type") ?? "",
  };
  if (!res.ok || !res.body) {
    stats.problems.push(`HTTP ${res.status} on stream=true`);
    return stats;
  }
  if (!stats.contentType.startsWith("text/event-stream")) {
    stats.problems.push(`Content-Type must be text/event-stream (got "${stats.contentType}")`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let firstContentAt = 0;
  let lastContentAt = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, idx).trim();
      buf = buf.slice(idx + 1);
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (payload === "[DONE]") {
        stats.sawDone = true;
        continue;
      }
      let chunk: ChatCompletion & { choices?: Array<{ delta?: { role?: string; content?: string }; finish_reason?: string | null }> };
      try {
        chunk = JSON.parse(payload);
      } catch {
        stats.problems.push("Non-JSON data line in SSE stream");
        continue;
      }
      if (chunk.object !== "chat.completion.chunk") {
        stats.problems.push(`Chunk object must be "chat.completion.chunk" (got "${chunk.object}")`);
      }
      if (chunk.usage && typeof chunk.usage.completion_tokens === "number") {
        stats.completionTokens = chunk.usage.completion_tokens;
      }
      const choice = chunk.choices?.[0];
      if (!choice) continue;
      if (choice.delta?.role === "assistant") stats.sawRole = true;
      if (typeof choice.delta?.content === "string" && choice.delta.content.length > 0) {
        const now = Date.now();
        if (stats.contentChunks === 0) {
          firstContentAt = now;
          stats.ttftMs = now - started;
        }
        lastContentAt = now;
        stats.contentChunks++;
      }
      if (typeof choice.finish_reason === "string") stats.sawFinish = true;
    }
  }
  if (
    stats.completionTokens &&
    stats.contentChunks > 1 &&
    lastContentAt > firstContentAt
  ) {
    stats.tokensPerSec =
      ((stats.completionTokens - 1) / (lastContentAt - firstContentAt)) * 1000;
  }
  return stats;
}

async function checkStreaming(t: ProbeTarget, checks: CheckResult[]): Promise<boolean> {
  const s = await runStream(t, "In two sentences, explain what a KV cache is.", 128);
  const structureOk =
    s.problems.length === 0 && s.contentChunks >= 2 && s.sawRole && s.sawFinish && s.sawDone;
  checks.push({
    name: "SSE streaming",
    passed: structureOk,
    detail: structureOk
      ? `${s.contentChunks} content chunks, role announced, finish_reason sent, terminated with [DONE] (TTFT ${s.ttftMs}ms)`
      : s.problems[0] ??
        `Stream must send ≥2 "chat.completion.chunk" deltas${s.sawRole ? "" : ", announce delta.role=\"assistant\""}${s.sawFinish ? "" : ", include a finish_reason chunk"}${s.sawDone ? "" : ", and terminate with data: [DONE]"}`,
  });
  return structureOk;
}

async function checkErrorShape(t: ProbeTarget, checks: CheckResult[]): Promise<boolean> {
  // Probe with an invalid parameter — unlike an unknown model name (which
  // SGLang accepts without validation), max_tokens: -1 draws a 400 from
  // OpenAI, vLLM, and SGLang alike. Accept OpenAI's nested error shape or
  // SGLang's flat {object: "error", message} variant.
  const res = await fetchWithTimeout(`${t.base}/chat/completions`, {
    method: "POST",
    headers: t.headers,
    timeoutMs: 15_000,
    body: JSON.stringify({
      model: t.model,
      messages: [{ role: "user", content: "hi" }],
      max_tokens: -1,
    }),
  });
  const body = await json<{
    error?: { message?: string };
    object?: string;
    message?: string;
  }>(res);
  const nested = typeof body?.error?.message === "string";
  const flat = body?.object === "error" && typeof body?.message === "string";
  const ok = res.status >= 400 && res.status < 500 && (nested || flat);
  checks.push({
    name: "error shape",
    passed: ok,
    detail: ok
      ? `max_tokens=-1 → HTTP ${res.status} with a readable error body (${nested ? "OpenAI-nested" : "flat"} shape)`
      : `Invalid params must return 4xx with {error: {message}} (or the flat {object:"error", message} variant) — got HTTP ${res.status}`,
  });
  return ok;
}

/** Full OpenAI-compatibility conformance suite against a user endpoint. */
export async function verifyOpenAICompat(
  rawUrl: string,
  apiKey?: string,
  modelHint?: string,
): Promise<EndpointResult> {
  const checks: CheckResult[] = [];
  try {
    const target = await resolveTarget(rawUrl, apiKey, modelHint, checks);
    if (!target) return { passed: false, checks, evidence: {} };
    await checkNonStreaming(target, checks);
    await checkMaxTokens(target, checks);
    await checkStreaming(target, checks);
    await checkErrorShape(target, checks);
    return {
      passed: checks.every((c) => c.passed),
      checks,
      evidence: { base: target.base, model: target.model },
    };
  } catch (e) {
    checks.push({
      name: "reachability",
      passed: false,
      detail: e instanceof Error ? e.message : String(e),
    });
    return { passed: false, checks, evidence: {} };
  }
}

/** Latency/throughput probe: median of 3 measured streaming runs after warmup. */
export async function verifyLatency(
  rawUrl: string,
  thresholds: { ttftMsMax?: number; tokensPerSecMin?: number },
  apiKey?: string,
  modelHint?: string,
): Promise<EndpointResult> {
  const checks: CheckResult[] = [];
  try {
    const target = await resolveTarget(rawUrl, apiKey, modelHint, checks);
    if (!target) return { passed: false, checks, evidence: {} };

    const prompt = "Write a detailed paragraph about GPU memory hierarchies.";
    await runStream(target, prompt, 64); // warmup
    const runs: StreamStats[] = [];
    for (let i = 0; i < 3; i++) runs.push(await runStream(target, prompt, 200));

    const usable = runs.filter((r) => r.ttftMs > 0 && r.tokensPerSec !== null);
    if (usable.length < 3) {
      checks.push({
        name: "measurement",
        passed: false,
        detail: "Could not complete 3 measured streaming runs (stream must send content deltas and usage).",
      });
      return { passed: false, checks, evidence: { runs } };
    }
    const median = (xs: number[]) => xs.slice().sort((a, b) => a - b)[Math.floor(xs.length / 2)];
    const ttft = median(usable.map((r) => r.ttftMs));
    const tps = median(usable.map((r) => r.tokensPerSec!));

    if (thresholds.ttftMsMax !== undefined) {
      checks.push({
        name: "TTFT",
        passed: ttft <= thresholds.ttftMsMax,
        detail: `median ${Math.round(ttft)}ms (must be ≤ ${thresholds.ttftMsMax}ms)`,
      });
    }
    if (thresholds.tokensPerSecMin !== undefined) {
      checks.push({
        name: "decode throughput",
        passed: tps >= thresholds.tokensPerSecMin,
        detail: `median ${tps.toFixed(1)} tok/s single-stream (must be ≥ ${thresholds.tokensPerSecMin})`,
      });
    }
    return {
      passed: checks.every((c) => c.passed),
      checks,
      evidence: {
        base: target.base,
        model: target.model,
        medianTtftMs: Math.round(ttft),
        medianTokensPerSec: Number(tps.toFixed(1)),
        runs: usable.map((r) => ({ ttftMs: r.ttftMs, tokensPerSec: r.tokensPerSec })),
      },
    };
  } catch (e) {
    checks.push({
      name: "reachability",
      passed: false,
      detail: e instanceof Error ? e.message : String(e),
    });
    return { passed: false, checks, evidence: {} };
  }
}
