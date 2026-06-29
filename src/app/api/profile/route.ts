import { NextRequest, NextResponse } from "next/server";

import { getProfileWithSettings, updateProfile } from "@/database/repositories/profile";
import { notFound, requireApiUser, serverError, unauthorized, validationError } from "@/lib/api";
import { profileUpdateSchema } from "@/lib/validation";

export async function GET() {
  const userId = await requireApiUser();
  if (!userId) return unauthorized();

  try {
    const result = await getProfileWithSettings(userId);
    return result ? NextResponse.json(result) : notFound("Profile");
  } catch (error) {
    return serverError(error);
  }
}

export async function PUT(request: NextRequest) {
  const userId = await requireApiUser();
  if (!userId) return unauthorized();

  const parsed = profileUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);

  try {
    const profile = await updateProfile(userId, parsed.data);
    return profile ? NextResponse.json({ profile }) : notFound("Profile");
  } catch (error) {
    return serverError(error);
  }
}
