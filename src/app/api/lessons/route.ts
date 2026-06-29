import { NextRequest, NextResponse } from "next/server";

import { listLessons } from "@/database/repositories/lessons";
import { requireApiUser, serverError, unauthorized } from "@/lib/api";

export async function GET(request: NextRequest) {
  const userId = await requireApiUser();
  if (!userId) return unauthorized();

  const status = request.nextUrl.searchParams.get("status");
  const validStatus = status === "unread" || status === "completed" || status === "skipped" ? status : undefined;
  const query = request.nextUrl.searchParams.get("q") ?? undefined;

  try {
    const lessons = await listLessons(userId, { status: validStatus, query });
    return NextResponse.json({ lessons });
  } catch (error) {
    return serverError(error);
  }
}
