import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";
import { resolve } from "path";

// Load environment variables
dotenv.config({ path: resolve(__dirname, ".env") });
dotenv.config({ path: resolve(__dirname, ".env.local") });

const databaseUrl =
  process.env.NODE_ENV === "production"
    ? process.env.DATABASE_URL_UNPOOLED
    : process.env.DATABASE_URL_LOCAL;

if (!databaseUrl) {
  throw new Error("Database URL not found in environment variables");
}

export default defineConfig({
  out: "./drizzle",
  schema: "./lib/db/schema/*",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
  verbose: true,
});
