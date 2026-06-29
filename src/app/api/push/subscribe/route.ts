import { z } from "zod";

import { requireApiUser, serverError, unauthorized, validationError } from "@/lib/api";
import { savePushSubscription } from "@/database/repositories/push-subscriptions";

const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  p256dh: z.string().min(1),
  auth: z.string().min(1),
  userAgent: z.string().optional(),
});

export async function POST(request: Request) {
  const userId = await requireApiUser();
  if (!userId) return unauthorized();

  try {
    const body = await request.json();
    const parsed = pushSubscriptionSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const subscription = await savePushSubscription(userId, parsed.data);
    return Response.json(subscription, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
