/* Manual verifier test rig: `npx tsx scripts/test-verifiers.ts`
 * Spins up a compliant mock OpenAI server and a broken one, probes both,
 * and exercises the GitHub-PR / URL / harness / quiz verifiers.
 */
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { verifyOpenAICompat, verifyLatency } from "../src/server/verifiers/openaiCompat";
import { verifyGithubPr } from "../src/server/verifiers/githubPr";
import { verifyUrl } from "../src/server/verifiers/urlCheck";
import { verifyHarnessReport } from "../src/server/verifiers/harness";
import { gradeQuiz } from "../src/server/quizBank";

let failures = 0;
function expect(name: string, cond: boolean, extra = "") {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${extra ? ` — ${extra}` : ""}`);
  if (!cond) failures++;
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => resolve(data));
  });
}

/** A faithful little OpenAI-compatible mock. `broken` omits usage + [DONE]. */
function mockServer(port: number, broken: boolean) {
  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    if (req.method === "GET" && req.url === "/v1/models") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          object: "list",
          data: [{ id: "mock-7b", object: "model", created: 1700000000, owned_by: "mock" }],
        }),
      );
      return;
    }
    if (req.method === "POST" && req.url === "/v1/chat/completions") {
      const body = JSON.parse(await readBody(req));
      if (typeof body.max_tokens === "number" && body.max_tokens < 1) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: { message: "max_tokens must be at least 1", type: "invalid_request_error", param: "max_tokens", code: null },
          }),
        );
        return;
      }
      if (body.model !== "mock-7b") {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: { message: `The model '${body.model}' does not exist.`, type: "invalid_request_error", code: "model_not_found" },
          }),
        );
        return;
      }
      const maxTokens = body.max_tokens ?? body.max_completion_tokens ?? 128;
      const words = "the quick brown fox jumps over the lazy dog again and again".split(" ");
      const completionTokens = Math.min(maxTokens, 40);
      const finish = completionTokens < 40 ? "length" : "stop";

      if (body.stream) {
        res.writeHead(200, { "Content-Type": "text/event-stream" });
        const chunk = (obj: object) => res.write(`data: ${JSON.stringify(obj)}\n\n`);
        const base = { id: "chatcmpl-mock", object: "chat.completion.chunk", created: 1700000000, model: "mock-7b" };
        chunk({ ...base, choices: [{ index: 0, delta: { role: "assistant" }, finish_reason: null }] });
        for (let i = 0; i < completionTokens; i++) {
          chunk({ ...base, choices: [{ index: 0, delta: { content: words[i % words.length] + " " }, finish_reason: null }] });
          await new Promise((r) => setTimeout(r, 5));
        }
        chunk({ ...base, choices: [{ index: 0, delta: {}, finish_reason: finish }] });
        if (!broken) {
          if (body.stream_options?.include_usage) {
            chunk({ ...base, choices: [], usage: { prompt_tokens: 12, completion_tokens: completionTokens, total_tokens: 12 + completionTokens } });
          }
          res.write("data: [DONE]\n\n");
        }
        res.end();
        return;
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          id: "chatcmpl-mock",
          object: "chat.completion",
          created: 1700000000,
          model: "mock-7b",
          choices: [
            {
              index: 0,
              message: { role: "assistant", content: words.slice(0, completionTokens).join(" ") },
              finish_reason: finish,
            },
          ],
          usage: broken
            ? undefined
            : { prompt_tokens: 12, completion_tokens: completionTokens, total_tokens: 12 + completionTokens },
        }),
      );
      return;
    }
    res.writeHead(404).end();
  });
  return new Promise<typeof server>((resolve) => server.listen(port, () => resolve(server)));
}

async function main() {
  // The SSRF guard blocks localhost by design; the dev escape hatch lets the
  // probes reach the 127.0.0.1 mocks. The guard itself is tested with the
  // hatch toggled off below.
  process.env.INFERQUEST_ALLOW_PRIVATE_URLS = "1";
  const { assertPublicUrl } = await import("../src/server/verifiers/net");

  const good = await mockServer(45871, false);
  const bad = await mockServer(45872, true);

  const g = await verifyOpenAICompat("http://127.0.0.1:45871");
  expect("openai-compat: compliant server passes", g.passed, g.checks.filter((c) => !c.passed).map((c) => `${c.name}: ${c.detail}`).join("; "));

  const b = await verifyOpenAICompat("http://127.0.0.1:45872/v1");
  const failedNames = b.checks.filter((c) => !c.passed).map((c) => c.name);
  expect("openai-compat: broken server fails on usage + SSE", !b.passed && failedNames.includes("usage accounting") && failedNames.includes("SSE streaming"), failedNames.join(","));

  const lat = await verifyLatency("http://127.0.0.1:45871", { ttftMsMax: 5000, tokensPerSecMin: 1 });
  expect("latency: mock passes generous thresholds", lat.passed, JSON.stringify(lat.evidence.medianTtftMs) + "ms, " + JSON.stringify(lat.evidence.medianTokensPerSec) + " tok/s");

  const latStrict = await verifyLatency("http://127.0.0.1:45871", { tokensPerSecMin: 100000 });
  expect("latency: impossible threshold fails", !latStrict.passed);

  good.close();
  bad.close();

  // SSRF guard itself, with the escape hatch off
  delete process.env.INFERQUEST_ALLOW_PRIVATE_URLS;
  let guarded = false;
  try {
    await assertPublicUrl("http://127.0.0.1:8000");
  } catch {
    guarded = true;
  }
  expect("ssrf: 127.0.0.1 rejected", guarded);
  let guarded2 = false;
  try {
    await assertPublicUrl("http://192.168.1.10/v1");
  } catch {
    guarded2 = true;
  }
  expect("ssrf: 192.168.x rejected", guarded2);

  // GitHub PR — a famous merged vLLM PR (FP8 support, known merged) and a non-merged case
  const pr = await verifyGithubPr("https://github.com/vllm-project/vllm/pull/4332", ["vllm-project/vllm"]);
  expect("github-pr: real merged vLLM PR passes", pr.passed, JSON.stringify(pr.evidence.title ?? pr.checks));
  const prWrongRepo = await verifyGithubPr("https://github.com/jneums/inferquest/pull/1", ["vllm-project/vllm"]);
  expect("github-pr: repo outside allowlist fails", !prWrongRepo.passed);
  const prBadUrl = await verifyGithubPr("https://gitlab.com/foo/bar/pull/1");
  expect("github-pr: non-github URL fails", !prBadUrl.passed);

  // URL verifier — a real, substantial, on-topic post
  const url = await verifyUrl("https://horace.io/brrr_intro.html", { mustContainAny: ["memory", "bandwidth"], minWords: 400 });
  expect("url: real technical post passes", url.passed, `${url.evidence.words} words`);
  const urlOff = await verifyUrl("https://example.com", { minWords: 400 });
  expect("url: thin page fails", !urlOff.passed);

  // Harness report validation
  const goodReport = {
    harness_version: "1.0",
    task_id: "kv-harness",
    passed: true,
    env: { gpu: "NVIDIA RTX 4090", torch: "2.6.0", python: "3.11.9" },
    checks: [
      { name: "logits-match", passed: true, detail: "max err 1e-4" },
      { name: "speedup", passed: true, detail: "5.2x" },
    ],
    metrics: { max_abs_err: 0.0001, speedup: 5.2 },
    duration_s: 42.5,
  };
  const h = verifyHarnessReport(goodReport, "kv-harness", { max_abs_err: { op: "<=", value: 5e-3 }, speedup: { op: ">=", value: 2 } });
  expect("harness: valid passing report accepted", h.passed);
  const h2 = verifyHarnessReport({ ...goodReport, metrics: { max_abs_err: 0.0001, speedup: 1.5 } }, "kv-harness", { speedup: { op: ">=", value: 2 } });
  expect("harness: below-threshold metric rejected", !h2.passed);
  const h3 = verifyHarnessReport(goodReport, "some-other-task", { });
  expect("harness: task-id mismatch rejected", !h3.passed);
  const h4 = verifyHarnessReport({ nonsense: true }, "kv-harness", {});
  expect("harness: malformed report rejected", !h4.passed);

  // Quiz grading
  const qPass = gradeQuiz("kv-cache-math", [2, 1, 2, 1], 75);
  expect("quiz: all-correct passes", qPass.passed, JSON.stringify(qPass.evidence));
  const qFail = gradeQuiz("kv-cache-math", [0, 0, 0, 0], 75);
  expect("quiz: all-wrong fails", !qFail.passed);
  const gauntlet = gradeQuiz("interview-gauntlet", [1, 1, 1, 1, 1, 1, 1, 1], 80);
  expect("quiz: gauntlet answer key sane", gauntlet.passed, JSON.stringify(gauntlet.evidence));

  console.log(failures === 0 ? "\nALL VERIFIER TESTS PASSED" : `\n${failures} FAILURES`);
  process.exit(failures === 0 ? 0 : 1);
}

main();
