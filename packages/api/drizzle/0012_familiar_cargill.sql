CREATE TYPE "public"."waitlist_tier" AS ENUM('BASIC', 'STANDARD', 'PRO');--> statement-breakpoint
CREATE TABLE "subscription" (
	"id" text PRIMARY KEY NOT NULL,
	"plan" text NOT NULL,
	"reference_id" text NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"status" text,
	"period_start" timestamp,
	"period_end" timestamp,
	"cancel_at_period_end" boolean,
	"seats" integer
);
--> statement-breakpoint
ALTER TABLE "waitlist_definitions" ADD COLUMN "tier" "waitlist_tier" DEFAULT 'BASIC' NOT NULL;