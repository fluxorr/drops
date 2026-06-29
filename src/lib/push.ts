import webpush from "web-push";

import type { PushSubscriptionInput } from "@/database/repositories/push-subscriptions";

export function getVapidConfiguration() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:hello@drops.app";

  if (!publicKey || !privateKey) {
    throw new Error("VAPID keys not configured");
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);

  return { publicKey, privateKey, subject };
}

export function sendNotification(
  subscription: PushSubscriptionInput,
  payload: { title: string; body: string; url?: string },
) {
  getVapidConfiguration();

  return webpush.sendNotification(
    {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    },
    JSON.stringify({
      title: payload.title,
      body: payload.body,
      data: { url: payload.url ?? "/today" },
    }),
  );
}
