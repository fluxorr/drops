import { getTodaysPlan } from "@/ai/engine";
import { requireApiUser, serverError, unauthorized } from "@/lib/api";

export async function POST(request: Request) {
  const userId = await requireApiUser();
  if (!userId) return unauthorized();

  try {
    const body = await request.json();
    const excludeTopicNames: string[] = body.excludeTopicNames ?? [];
    const plan = await getTodaysPlan(userId, excludeTopicNames);
    return Response.json(plan);
  } catch (error) {
    return serverError(error);
  }
}
