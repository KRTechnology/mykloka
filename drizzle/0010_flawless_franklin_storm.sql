CREATE TYPE "public"."work_structure" AS ENUM('FULLY_REMOTE', 'HYBRID', 'FULLY_ONSITE');--> statement-breakpoint
CREATE TABLE "work_locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"address" text NOT NULL,
	"coordinates" "point" NOT NULL,
	"radius_in_meters" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "work_location_id" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "work_structure" "work_structure" DEFAULT 'HYBRID' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_work_location_id_work_locations_id_fk" FOREIGN KEY ("work_location_id") REFERENCES "public"."work_locations"("id") ON DELETE set null ON UPDATE no action;