import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

export const taskStatusEnum = pgEnum("task_status", [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "APPROVED",
  "REJECTED",
]);

export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  createdById: uuid("created_by_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  assignedToId: uuid("assigned_to_id").references(() => users.id, {
    onDelete: "set null",
  }),
  approvedById: uuid("approved_by_id").references(() => users.id, {
    onDelete: "set null",
  }),
  approvalDate: timestamp("approval_date"),
  completionApprovedById: uuid("completion_approved_by_id").references(
    () => users.id,
    { onDelete: "set null" }
  ),
  completionApprovalDate: timestamp("completion_approval_date"),
  startTime: timestamp("start_time"),
  dueTime: timestamp("due_time"),
  completedAt: timestamp("completed_at"),
  status: taskStatusEnum("status").default("PENDING").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  requiresApproval: boolean("requires_approval").default(false).notNull(),
});

export const tasksRelations = relations(tasks, ({ one }) => ({
  createdBy: one(users, {
    fields: [tasks.createdById],
    references: [users.id],
  }),
  assignedTo: one(users, {
    fields: [tasks.assignedToId],
    references: [users.id],
  }),
  approvedBy: one(users, {
    fields: [tasks.approvedById],
    references: [users.id],
  }),
  completionApprovedBy: one(users, {
    fields: [tasks.completionApprovedById],
    references: [users.id],
  }),
}));
