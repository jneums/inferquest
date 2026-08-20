import {
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

/** One row per completed task per user. Deleting the row un-completes it. */
export const taskCompletions = pgTable(
  "task_completions",
  {
    userId: text("user_id").notNull(),
    taskId: text("task_id").notNull(),
    xp: integer("xp").notNull(),
    /** Local date (YYYY-MM-DD) in the user's timezone, supplied by the client. */
    date: text("date").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.taskId] })],
);

/** Per-user spaced-repetition state for one question. */
export const reviewStates = pgTable(
  "review_states",
  {
    userId: text("user_id").notNull(),
    questionId: text("question_id").notNull(),
    due: timestamp("due", { withTimezone: true }).notNull(),
    intervalDays: doublePrecision("interval_days").notNull(),
    ease: doublePrecision("ease").notNull(),
    reps: integer("reps").notNull(),
    lapses: integer("lapses").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.questionId] })],
);

/** Every verification attempt, pass or fail, with the evidence collected. */
export const verifications = pgTable(
  "verifications",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    taskId: text("task_id").notNull(),
    verifierType: text("verifier_type").notNull(),
    passed: integer("passed").notNull(), // 0/1; keeps the row queryable without booleans-in-jsonb
    /** What the user submitted (url, pr link, harness report, quiz answers). */
    submission: jsonb("submission").notNull(),
    /** What the verifier observed (per-check results, measured metrics). */
    evidence: jsonb("evidence").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("verifications_user_task_idx").on(t.userId, t.taskId)],
);
