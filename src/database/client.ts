import { createClient } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";

import { readRemoteDatabaseEnv } from "./env";
import * as schema from "./schemas";

export type Database = LibSQLDatabase<typeof schema>;

let database: Database | null | undefined;

export function getDatabase(): Database | null {
  if (database !== undefined) {
    return database;
  }

  const env = readRemoteDatabaseEnv();
  if (!env) {
    database = null;
    return null;
  }

  const client = createClient({
    url: env.TURSO_DATABASE_URL,
    authToken: env.TURSO_AUTH_TOKEN,
  });

  database = drizzle(client, { schema }) as Database;
  return database;
}
