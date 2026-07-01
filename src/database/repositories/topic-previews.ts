import { and, eq } from "drizzle-orm";

import { getDatabase, type Database } from "../client";
import { topicPreviews } from "../schemas";
import type { TopicPreview } from "@/ai/topic-preview";

export async function getCachedPreview(
  userId: string,
  topicName: string,
  database?: Database | null,
): Promise<TopicPreview | null> {
  const db = database ?? getDatabase();
  if (!db) return null;

  const [row] = await db
    .select()
    .from(topicPreviews)
    .where(
      and(
        eq(topicPreviews.userId, userId),
        eq(topicPreviews.topicName, topicName.trim().toLocaleLowerCase("en-IN")),
      ),
    );

  return row ? (row.previewData as TopicPreview) : null;
}

export async function saveCachedPreview(
  userId: string,
  topicName: string,
  previewData: TopicPreview,
  database?: Database | null,
) {
  const db = database ?? getDatabase();
  if (!db) return;

  const normalized = topicName.trim().toLocaleLowerCase("en-IN");

  await db
    .insert(topicPreviews)
    .values({
      userId,
      topicName: normalized,
      previewData,
    })
    .onConflictDoUpdate({
      target: [topicPreviews.userId, topicPreviews.topicName],
      set: {
        previewData,
        updatedAt: new Date(),
      },
    });
}
