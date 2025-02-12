CREATE TYPE "public"."attendance_status" AS ENUM('present', 'late', 'absent');--> statement-breakpoint
ALTER TABLE "attendance" ALTER COLUMN "clock_in_location" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "attendance" ALTER COLUMN "clock_in_address" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "attendance" ALTER COLUMN "clock_in_address" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "attendance" ALTER COLUMN "clock_out_address" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "attendance" ADD COLUMN "status" "attendance_status" DEFAULT 'present' NOT NULL;