import { relations } from "drizzle-orm";
import {
  boolean,
  pgTable,
  timestamp,
  uuid,
  varchar,
  type AnyPgColumn,
  pgEnum,
} from "drizzle-orm/pg-core";
import { departments } from "./departments";
import { roles } from "./roles";
import { workLocations } from "./work-locations";

export const workStructureEnum = pgEnum("work_structure", [
  "FULLY_REMOTE",
  "HYBRID",
  "FULLY_ONSITE",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email").notNull().unique(),
  passwordHash: varchar("password_hash").notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  phoneNumber: varchar("phone_number"),
  managerId: uuid("manager_id").references((): AnyPgColumn => users.id, {
    onDelete: "set null",
  }),
  roleId: uuid("role_id").references((): AnyPgColumn => roles.id, {
    onDelete: "set null",
  }),
  departmentId: uuid("department_id").references(
    (): AnyPgColumn => departments.id,
    { onDelete: "set null" }
  ),
  workLocationId: uuid("work_location_id").references(
    (): AnyPgColumn => workLocations.id,
    { onDelete: "set null" }
  ),
  workStructure: workStructureEnum("work_structure")
    .notNull()
    .default("HYBRID"),
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
    relationName: "userToManager",
  }),
  subordinates: many(users, {
    relationName: "userToManager",
  }),
  workLocation: one(workLocations, {
    fields: [users.workLocationId],
    references: [workLocations.id],
  }),
}));
