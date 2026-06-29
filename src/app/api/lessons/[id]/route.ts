import { NextRequest, NextResponse } from "next/server";

import { getLesson, setLessonStatus } from "@/database/repositories/lessons";
import { notFound, requireApiUser, serverError, unauthorized, validationError } from "@/lib/api";
import { lessonStatusSchema } from "@/lib/validation";

export async function GET(_request: NextRequest, context: RouteContext<"/api/lessons/[id]">) {
  const userId = await requireApiUser();
  if (!userId) return unauthorized();
  const { id } = await context.params;

  try {
    const lesson = await getLesson(userId, id);
    return lesson ? NextResponse.json({ lesson }) : notFound("Lesson");
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext<"/api/lessons/[id]">) {
  const userId = await requireApiUser();
  if (!userId) return unauthorized();

  const parsed = lessonStatusSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);
  const { id } = await context.params;

  try {
    const lesson = await setLessonStatus(userId, id, parsed.data.status);
    return lesson ? NextResponse.json({ lesson }) : notFound("Unread lesson");
  } catch (error) {
    return serverError(error);
  }
}
