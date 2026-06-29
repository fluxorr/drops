import { and, asc, eq } from "drizzle-orm";

import { getDatabase, type Database } from "../client";
import { pushSubscriptions } from "../schemas";

export type PushSubscriptionInput = {
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
};

export async function savePushSubscription(
  userId: string,
  subscription: PushSubscriptionInput,
  database?: Database | null,
) {
  const db = database ?? getDatabase();
  if (!db) return null;

  const now = new Date();
  const [result] = await db
    .insert(pushSubscriptions)
    .values({
      userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.p256dh,
      auth: subscription.auth,
      userAgent: subscription.userAgent,
    })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
        userAgent: subscription.userAgent ?? null,
        lastSuccessAt: now,
        updatedAt: now,
      },
    })
    .returning();
  return result;
}

export async function listPushSubscriptions(
  userId: string,
  database?: Database | null,
) {
  const db = database ?? getDatabase();
  if (!db) return [];

  return db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, userId))
    .orderBy(asc(pushSubscriptions.createdAt));
}

export async function removePushSubscription(
  id: string,
  userId: string,
  database?: Database | null,
) {
  const db = database ?? getDatabase();
  if (!db) return null;

  const [result] = await db
    .delete(pushSubscriptions)
    .where(and(eq(pushSubscriptions.id, id), eq(pushSubscriptions.userId, userId)))
    .returning();
  return result;
}

export async function markSubscriptionSuccess(
  id: string,
  database?: Database | null,
) {
  const db = database ?? getDatabase();
  if (!db) return;

  await db
    .update(pushSubscriptions)
    .set({ lastSuccessAt: new Date(), updatedAt: new Date() })
    .where(eq(pushSubscriptions.id, id));
}

export async function markSubscriptionFailure(
  id: string,
  database?: Database | null,
) {
  const db = database ?? getDatabase();
  if (!db) return;

  await db
    .update(pushSubscriptions)
    .set({ lastFailureAt: new Date(), updatedAt: new Date() })
    .where(eq(pushSubscriptions.id, id));
}
