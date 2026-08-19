CREATE TABLE "task_completions" (
	"user_id" text NOT NULL,
	"task_id" text NOT NULL,
	"xp" integer NOT NULL,
	"date" text NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "task_completions_user_id_task_id_pk" PRIMARY KEY("user_id","task_id")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"task_id" text NOT NULL,
	"verifier_type" text NOT NULL,
	"passed" integer NOT NULL,
	"submission" jsonb NOT NULL,
	"evidence" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "verifications_user_task_idx" ON "verifications" USING btree ("user_id","task_id");