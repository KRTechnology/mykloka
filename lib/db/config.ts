// lib/db/index.ts
import { drizzle } from "drizzle-orm/neon-http";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import { neon } from "@neondatabase/serverless";
import postgres from "postgres";
import { env } from "@/lib/env";

// For development (local PostgreSQL)
const getLocalDb = () => {
  const queryClient = postgres(env.DATABASE_URL_LOCAL);
  return drizzlePostgres(queryClient);
};

// For production (Neon)
const getNeonDb = () => {
  const sql = neon(env.DATABASE_URL!);
  return drizzle(sql); // Use drizzle directly with the neon client
};

// For migrations
export const migrationClient = postgres(
  env.NODE_ENV === "production"
    ? env.DATABASE_URL!
    : env.DATABASE_URL_LOCAL!,
  {
    max: 1,
    ssl: env.NODE_ENV === "production",
  }
);

// Export the appropriate client based on environment
export const db = env.NODE_ENV === "production" ? getNeonDb() : getLocalDb();
