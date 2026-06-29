import { asc, eq } from "drizzle-orm";

import { getDatabase, type Database } from "../client";
import { concepts } from "../schemas";

export async function listConcepts(userId: string, database?: Database | null) {
  const db = database ?? getDatabase();
  if (!db) return [];

  return db
    .select()
    .from(concepts)
    .where(eq(concepts.userId, userId))
    .orderBy(asc(concepts.name));
}
