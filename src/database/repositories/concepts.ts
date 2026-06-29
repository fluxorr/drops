import { asc, eq } from "drizzle-orm";

import { getDatabase, type Database } from "../client";
import { concepts } from "../schemas";

export async function listConcepts(userId: string, database: Database = getDatabase()) {
  return database
    .select()
    .from(concepts)
    .where(eq(concepts.userId, userId))
    .orderBy(asc(concepts.name));
}
