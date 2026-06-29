import { generateDailyLesson } from "@/ai/engine";
import { serverError } from "@/lib/api";
import { getDatabase } from "@/database/client";
import { listPushSubscriptions, markSubscriptionSuccess, markSubscriptionFailure } from "@/database/repositories/push-subscriptions";
import { getSettings } from "@/database/repositories/settings";
import { sendNotification } from "@/lib/push";

export const maxDuration = 120;

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return Response.json({ error: "userId query parameter is required" }, { status: 400 });
  }

  try {
    const database = getDatabase();
    const result = await generateDailyLesson(userId, database);

    if (result.skipped || !result.lesson) {
      return Response.json({ skipped: true, reason: result.reason });
    }

    const settings = await getSettings(userId, database);
    if (settings?.pushEnabled) {
      const subscriptions = await listPushSubscriptions(userId, database);

      for (const sub of subscriptions) {
        try {
          await sendNotification(
            { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth, userAgent: sub.userAgent ?? undefined },
            {
            title: result.lesson.title,
            body: `${result.lesson.readMinutes} minute read`,
            url: "/today",
          });
          await markSubscriptionSuccess(sub.id, database);
        } catch {
          await markSubscriptionFailure(sub.id, database);
        }
      }
    }

    return Response.json({
      skipped: false,
      lesson: {
        id: result.lesson.id,
        title: result.lesson.title,
        readMinutes: result.lesson.readMinutes,
        whyThisLesson: result.lesson.whyThisLesson,
      },
    });
  } catch (error) {
    return serverError(error);
  }
}
