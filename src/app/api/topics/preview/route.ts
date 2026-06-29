import { previewTopic } from "@/ai/topic-preview";
import { getProfile } from "@/database/repositories/profile";
import { requireApiUser, serverError, unauthorized } from "@/lib/api";

export async function POST(request: Request) {
  const userId = await requireApiUser();
  if (!userId) return unauthorized();

  const { topicName } = await request.json();
  if (!topicName || typeof topicName !== "string") {
    return Response.json({ error: "topicName is required" }, { status: 400 });
  }

  const profile = await getProfile(userId);
  if (!profile) {
    return Response.json({ error: "Profile not found" }, { status: 404 });
  }

  try {
    const preview = await previewTopic(
      topicName,
      profile.learningGoal,
      profile.background ?? "",
    );
    if (!preview) {
      return Response.json({ error: "Failed to generate preview" }, { status: 500 });
    }
    return Response.json(preview);
  } catch (error) {
    return serverError(error);
  }
}
