CREATE TABLE "review_states" (
	"user_id" text NOT NULL,
	"question_id" text NOT NULL,
	"due" timestamp with time zone NOT NULL,
	"interval_days" double precision NOT NULL,
	"ease" double precision NOT NULL,
	"reps" integer NOT NULL,
	"lapses" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "review_states_user_id_question_id_pk" PRIMARY KEY("user_id","question_id")
);
