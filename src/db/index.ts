import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

let _db: NodePgDatabase<typeof schema> | null = null;

/**
 * Lazy singleton so importing this module never requires DATABASE_URL at
 * build time — only the first query does. Works with Vercel Postgres/Neon
 * (use the pooled connection string) and plain Postgres (Render, RDS, local).
 */
export function db(): NodePgDatabase<typeof schema> {
  if (!_db) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    _db = drizzle(new Pool({ connectionString: url, max: 5 }), { schema });
  }
  return _db;
}

export { schema };
