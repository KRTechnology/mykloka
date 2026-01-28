// // lib/db/index.ts
// import { neon } from "@neondatabase/serverless";
// import { drizzle } from "drizzle-orm/neon-http";
// import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
// import postgres from "postgres";
// import * as schema from "./schema";

// // Debug environment

// if (!process.env.DATABASE_URL_LOCAL) {
//   throw new Error("DATABASE_URL_LOCAL is not defined in environment variables");
// }

// // For development (local PostgreSQL)
// const getLocalDb = () => {
//   const queryClient = postgres(process.env.DATABASE_URL_LOCAL!, {
//     max: 1,
//     ssl: false,
//   });
//   return drizzlePostgres(queryClient, { schema });
// };

// // For production (Neon)
// const getNeonDb = () => {
//   if (!process.env.DATABASE_URL) {
//     throw new Error("DATABASE_URL is not defined in environment variables");
//   }
//   const sql = neon(process.env.DATABASE_URL);
//   return drizzle(sql, { schema });
// };

// // For migrations
// export const migrationClient = postgres(
//   process.env.NODE_ENV === "production"
//     ? process.env.DATABASE_URL!
//     : process.env.DATABASE_URL_LOCAL!,
//   {
//     max: 1,
//     ssl: process.env.NODE_ENV === "production",
//   }
// );

// // Export the appropriate client based on environment
// export const db =
//   process.env.NODE_ENV === "production" ? getNeonDb() : getLocalDb();
// lib/db/index.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import postgres from "postgres";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const isNeon = process.env.DATABASE_URL?.includes("neon.tech");

// ---- NEON (HTTP driver) ----
const getNeonDb = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }
  const sql = neon(process.env.DATABASE_URL);
  return drizzle(sql, { schema });
};

// ---- POSTGRES (tcp) ----
const getPostgresDb = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }
  const queryClient = postgres(process.env.DATABASE_URL, {
    max: 1,
    ssl: isNeon ? { rejectUnauthorized: false } : false,
  });
  return drizzlePostgres(queryClient, { schema });
};

// ---- MIGRATIONS ----
export const migrationClient = postgres(process.env.DATABASE_URL!, {
  max: 1,
  ssl: isNeon ? { rejectUnauthorized: false } : false,
});

// ---- MAIN DB EXPORT ----
// Use Neon HTTP when available, fallback to tcp
export const db = isNeon ? getNeonDb() : getPostgresDb();
