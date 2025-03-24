import { relations } from "drizzle-orm";
import {
  pgTable,
  point,
  timestamp,
  uuid,
  varchar,
  text,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const workLocations = pgTable("work_locations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name").notNull(),
  address: text("address").notNull(),
  coordinates: point("coordinates").notNull(),
  radiusInMeters: integer("radius_in_meters").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const workLocationsRelations = relations(workLocations, ({ many }) => ({
  users: many(users),
}));
