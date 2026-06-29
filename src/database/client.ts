import { createClient } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";

import { readRemoteDatabaseEnv } from "./env";
import * as schema from "./schemas";

export type Database = LibSQLDatabase<typeof schema>;

let database: Database | undefined;

export function getDatabase(): Database {
  if (database) {
    return database;
  }

  const env = readRemoteDatabaseEnv();
  const client = createClient({
    url: env.TURSO_DATABASE_URL,
    authToken: env.TURSO_AUTH_TOKEN,
  });

  database = drizzle(client, { schema });
  return database;
}
