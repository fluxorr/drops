import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

loadEnvConfig(process.cwd());

export default defineConfig({
  schema: "./src/database/schemas/index.ts",
  out: "./src/database/migrations",
  dialect: "turso",
  strict: true,
  verbose: true,
  dbCredentials: {
    // Generation is offline. Remote operations fail clearly until Turso is configured.
    url: process.env.TURSO_DATABASE_URL ?? "libsql://remote-database-required.invalid",
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
