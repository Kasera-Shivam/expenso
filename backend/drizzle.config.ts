import env from "./config/env.config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  dbCredentials: { url: env.DATABASE_URL },
  schema: "./db/schema/index.ts",
  out: "./drizzle",
  strict: true,
  verbose: true,
});
