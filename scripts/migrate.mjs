// Runs drizzle migrations before build when a database is configured.
// Prefers the direct (unpooled) connection for DDL; skips cleanly when no
// DATABASE_URL is present (local builds, CI without a DB).
import { spawnSync } from "node:child_process";

const raw =
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL;

// Vercel substitutes "[SENSITIVE]"? No — that's only in `env pull` output;
// at build time the real value is present. Guard against absent/placeholder.
if (!raw || raw === "[SENSITIVE]") {
  console.log("migrate: no DATABASE_URL in env — skipping migrations");
  process.exit(0);
}

console.log("migrate: applying drizzle migrations…");
const res = spawnSync("npx", ["drizzle-kit", "migrate"], {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: raw },
});
process.exit(res.status ?? 1);
