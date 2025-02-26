CREATE TYPE "public"."waitlist_status" AS ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."waitlist_entry_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TABLE "waitlist_definitions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" varchar(256) NOT NULL,
	"status" "waitlist_status" NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "waitlist_entries" (
	"id" uuid PRIMARY KEY NOT NULL,
	"definition_id" uuid NOT NULL,
	"email" varchar(256) NOT NULL,
	"status" "waitlist_entry_status" NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "waitlist_entries" ADD CONSTRAINT "waitlist_entries_definition_id_waitlist_definitions_id_fk" FOREIGN KEY ("definition_id") REFERENCES "public"."waitlist_definitions"("id") ON DELETE no action ON UPDATE no action;