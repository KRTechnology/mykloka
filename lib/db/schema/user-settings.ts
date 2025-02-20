import { pgTable, uuid, boolean, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const userSettings = pgTable("user_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  emailClockInNotifications: boolean("email_clock_in_notifications")
    .notNull()
    .default(false),
  emailTaskNotifications: boolean("email_task_notifications")
    .notNull()
    .default(false),
  emailDepartmentUpdates: boolean("email_department_updates")
    .notNull()
    .default(false),
  emailLeaveRequestUpdates: boolean("email_leave_request_updates")
    .notNull()
    .default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
