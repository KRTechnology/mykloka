import { relations } from "drizzle-orm";
import { pgTable, point, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";

export const attendance = pgTable("attendance", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  clockInTime: timestamp("clock_in_time").notNull(),
  clockOutTime: timestamp("clock_out_time"),
  clockInLocation: point("clock_in_location"),
  clockOutLocation: point("clock_out_location"),
  clockInAddress: varchar("clock_in_address"),
  clockOutAddress: varchar("clock_out_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const attendanceRelations = relations(attendance, ({ one }) => ({
  user: one(users, {
    fields: [attendance.userId],
    references: [users.id],
  }),
}));
