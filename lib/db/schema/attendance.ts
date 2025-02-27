import { relations } from "drizzle-orm";
import {
  pgTable,
  point,
  timestamp,
  uuid,
  varchar,
  text,
  pgEnum,
  boolean,
} from "drizzle-orm/pg-core";
import { users } from "./users";

// Create an enum for attendance status
export const attendanceStatusEnum = pgEnum("attendance_status", [
  "present",
  "late",
  "absent",
]);

export const attendance = pgTable("attendance", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  clockInTime: timestamp("clock_in_time").notNull(),
  clockOutTime: timestamp("clock_out_time"),
  clockInLocation: point("clock_in_location").notNull(),
  clockOutLocation: point("clock_out_location"),
  clockInAddress: text("clock_in_address").notNull(),
  clockOutAddress: text("clock_out_address"),
  status: attendanceStatusEnum("status").notNull().default("present"),
  isRemote: boolean("is_remote").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const attendanceRelations = relations(attendance, ({ one }) => ({
  user: one(users, {
    fields: [attendance.userId],
    references: [users.id],
  }),
}));
