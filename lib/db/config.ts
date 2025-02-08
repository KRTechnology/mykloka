import { drizzle } from "drizzle-orm/postgres-js";
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import postgres from "postgres";
import { neon } from "@neondatabase/serverless";
import { env } from "@/lib/env";

const getDbClient = () => {
  if (env.NODE_ENV === "production") {
    // Use Neon serverless driver in production
    const sql = neon(env.DATABASE_URL);
    return drizzleNeon(sql);
  } else {
    // Use regular postgres in development
    const queryClient = postgres(env.DATABASE_URL_LOCAL);
    return drizzle(queryClient);
  }
};

// For migrations (always use postgres driver)
export const migrationClient = postgres(env.DATABASE_URL, { max: 1 });

// Export the appropriate client based on environment
export const db = getDbClient();
