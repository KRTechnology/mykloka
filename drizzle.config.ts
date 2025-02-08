// import type { Config } from "drizzle-kit";
// import { env } from "@/lib/env";

// export default {
//   schema: "./lib/db/schema/*",
//   out: "./drizzle",
//   driver: 'pg',
//   dbCredentials: {
//     connectionString: env.DATABASE_URL,
//   },
//   verbose: true,
//   strict: true,
// } satisfies Config;

import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { env } from "@/lib/env";

export default defineConfig({
  out: "./drizzle",
  schema: "./lib/db/schema/*",
  dialect: "postgresql",
  dbCredentials: {
    url: env.NODE_ENV === "production" ? env.POSTGRES_URL! : env.DATABASE_URL!,
  },
});
