import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { roles } from "./roles";
import { departments } from "./departments";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email").notNull().unique(),
  passwordHash: varchar("password_hash").notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  phoneNumber: varchar("phone_number"),
  managerId: uuid("manager_id").references((): AnyPgColumn => users.id),
  roleId: uuid("role_id").references((): AnyPgColumn => roles.id),
  departmentId: uuid("department_id").references(
    (): AnyPgColumn => departments.id
  ),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  profileImage: varchar("profile_image"),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  department: one(departments, {
    fields: [users.departmentId],
    references: [departments.id],
  }),
  manager: one(users, {
    fields: [users.managerId],
    references: [users.id],
  }),
  subordinates: many(users),
}));
