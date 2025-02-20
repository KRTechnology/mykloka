ALTER TABLE "departments" DROP CONSTRAINT "departments_name_unique";--> statement-breakpoint
ALTER TABLE "departments" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "departments" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "departments" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "departments" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "departments" ADD COLUMN "description" text;