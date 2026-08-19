/* Curriculum integrity audit: `npx tsx scripts/audit-curriculum.ts`
 * Checks id uniqueness, prereq graph sanity, verifier wiring (quiz ids,
 * harness script/task-id/metric agreement with harness/graders), XP/level
 * calibration, and link liveness.
 */
import { readFileSync } from "node:fs";
import { PHASES, QUESTS, TASKS_BY_ID, TOTAL_XP } from "../src/data/curriculum";
import { QUIZZES } from "../src/server/quizBank";
import { LEVELS } from "../src/lib/levels";

let problems = 0;
const flag = (msg: string) => {
  console.log(`PROBLEM: ${msg}`);
  problems++;
};
const ok = (msg: string) => console.log(`ok: ${msg}`);

// ── 1. id uniqueness and phase references ──
{
  const qIds = new Set<string>();
  const tIds = new Set<string>();
  const phaseIds = new Set(PHASES.map((p) => p.id));
  for (const q of QUESTS) {
    if (qIds.has(q.id)) flag(`duplicate quest id ${q.id}`);
    qIds.add(q.id);
    if (!phaseIds.has(q.phaseId)) flag(`quest ${q.id} references unknown phase ${q.phaseId}`);
    for (const t of q.tasks) {
      if (tIds.has(t.id)) flag(`duplicate task id ${t.id}`);
      tIds.add(t.id);
    }
  }
  ok(`${qIds.size} quests, ${tIds.size} tasks, ids unique`);
}

// ── 2. prereq graph: exists, acyclic, everything reachable ──
{
  const byId = new Map(QUESTS.map((q) => [q.id, q]));
  for (const q of QUESTS)
    for (const p of q.prereqs)
      if (!byId.has(p)) flag(`quest ${q.id} prereq ${p} does not exist`);

  const state = new Map<string, number>(); // 0 visiting, 1 done
  const visit = (id: string, path: string[]): void => {
    if (state.get(id) === 1) return;
    if (state.get(id) === 0) {
      flag(`prereq cycle: ${[...path, id].join(" -> ")}`);
      return;
    }
    state.set(id, 0);
    for (const p of byId.get(id)?.prereqs ?? []) visit(p, [...path, id]);
    state.set(id, 1);
  };
  for (const q of QUESTS) visit(q.id, []);
  const roots = QUESTS.filter((q) => q.prereqs.length === 0);
  ok(`prereq graph acyclic; ${roots.length} root quest(s): ${roots.map((q) => q.id).join(", ")}`);
}

// ── 3. verifier wiring ──
{
  // quiz ids
  for (const [id, t] of TASKS_BY_ID) {
    if (t.verifier?.type === "quiz" && !QUIZZES[t.verifier.quizId])
      flag(`task ${id} references unknown quiz ${t.verifier.quizId}`);
  }
  const referencedQuizzes = new Set(
    [...TASKS_BY_ID.values()].flatMap((t) =>
      t.verifier?.type === "quiz" ? [t.verifier.quizId] : [],
    ),
  );
  for (const quizId of Object.keys(QUIZZES))
    if (!referencedQuizzes.has(quizId)) flag(`quiz ${quizId} defined but never referenced`);

  // quiz answerIndex bounds + passPct sanity
  for (const [quizId, quiz] of Object.entries(QUIZZES))
    quiz.questions.forEach((q, i) => {
      if (q.answerIndex < 0 || q.answerIndex >= q.choices.length)
        flag(`quiz ${quizId} Q${i + 1} answerIndex out of range`);
    });

  // harness script mapping: parse harness/graders/__init__.py
  const initPy = readFileSync("harness/graders/__init__.py", "utf8");
  const scriptMap = new Map<string, string>(); // script -> task id
  for (const m of initPy.matchAll(/"([\w-]+)":\s*\("([\w-]+)",\s*"(\w+)"\)/g))
    scriptMap.set(m[1], m[2]);

  for (const [id, t] of TASKS_BY_ID) {
    if (t.verifier?.type !== "harness") continue;
    const mapped = scriptMap.get(t.verifier.script);
    if (!mapped) {
      flag(`task ${id} harness script "${t.verifier.script}" not in graders/__init__.py`);
      continue;
    }
    if (mapped !== id)
      flag(`harness script ${t.verifier.script} maps to task "${mapped}" but curriculum task is "${id}"`);
    // metric keys must be produced by the grader source
    const graderModule = initPy.match(new RegExp(`"${t.verifier.script}":\\s*\\("[\\w-]+",\\s*"(\\w+)"\\)`))?.[1];
    const src = readFileSync(`harness/graders/${graderModule}.py`, "utf8");
    for (const metric of Object.keys(t.verifier.metrics))
      if (!src.includes(`metrics["${metric}"]`))
        flag(`task ${id} requires metric "${metric}" but grader ${graderModule}.py never sets it`);
  }
  for (const script of scriptMap.keys()) {
    const used = [...TASKS_BY_ID.values()].some(
      (t) => t.verifier?.type === "harness" && t.verifier.script === script,
    );
    if (!used) flag(`grader script ${script} defined but no task uses it`);
  }
  ok("verifier wiring checked (quizzes, harness scripts, metric keys)");
}

// ── 4. XP / level calibration ──
{
  const maxLevel = LEVELS[LEVELS.length - 1];
  if (TOTAL_XP < maxLevel.minXP)
    flag(`TOTAL_XP ${TOTAL_XP} < top level threshold ${maxLevel.minXP} — unreachable`);
  const offerXP = TASKS_BY_ID.get("offer-signed")?.xp ?? 0;
  const withoutOffer = TOTAL_XP - offerXP;
  console.log(
    `ok: TOTAL_XP=${TOTAL_XP}, top level at ${maxLevel.minXP}, without-offer max=${withoutOffer} (${LEVELS.filter((l) => withoutOffer >= l.minXP).length} levels reachable pre-offer)`,
  );
  for (let i = 1; i < LEVELS.length; i++)
    if (LEVELS[i].minXP <= LEVELS[i - 1].minXP) flag(`levels not strictly increasing at ${LEVELS[i].n}`);
}

async function checkLinks() {
  const urls = new Map<string, string[]>(); // url -> task ids
  for (const [id, t] of TASKS_BY_ID) {
    const found = [
      ...(t.link ? [t.link] : []),
      ...(t.detail?.match(/https?:\/\/[^\s)]+/g) ?? []),
      ...((t.detail?.match(/\b([a-z0-9-]+\.[a-z]{2,}(?:\.[a-z]{2,})?\/[\w./-]+)/gi) ?? [])
        .filter((u) => !u.startsWith("http"))
        .map((u) => `https://${u}`)),
    ];
    for (const u of found) urls.set(u, [...(urls.get(u) ?? []), id]);
  }
  console.log(`\nchecking ${urls.size} unique URLs…`);
  const results = await Promise.allSettled(
    [...urls.keys()].map(async (u) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      try {
        let res = await fetch(u, {
          method: "GET",
          redirect: "follow",
          signal: controller.signal,
          headers: { "User-Agent": "Mozilla/5.0 (compatible; InferQuest-linkcheck)" },
        });
        return { u, status: res.status };
      } finally {
        clearTimeout(timer);
      }
    }),
  );
  results.forEach((r, i) => {
    const u = [...urls.keys()][i];
    if (r.status === "rejected") flag(`link DEAD (${r.reason?.name ?? "error"}): ${u} [tasks: ${urls.get(u)!.join(",")}]`);
    else if (r.value.status === 404 || r.value.status === 410)
      flag(`link ${r.value.status}: ${u} [tasks: ${urls.get(u)!.join(",")}]`);
    else if (r.value.status >= 400)
      console.log(`warn: HTTP ${r.value.status} (may be bot-blocking): ${u} [tasks: ${urls.get(u)!.join(",")}]`);
  });
  ok("link check complete");
}

checkLinks().then(() => {
  console.log(problems === 0 ? "\nAUDIT CLEAN" : `\n${problems} PROBLEM(S) FOUND`);
  process.exit(problems === 0 ? 0 : 1);
});
