import { NextRequest, NextResponse } from "next/server";

import { getSettings, updateSettings } from "@/database/repositories/settings";
import { notFound, requireApiUser, serverError, unauthorized, validationError } from "@/lib/api";
import { settingsUpdateSchema } from "@/lib/validation";

export async function GET() {
  const userId = await requireApiUser();
  if (!userId) return unauthorized();

  try {
    const settings = await getSettings(userId);
    return settings ? NextResponse.json({ settings }) : notFound("Settings");
  } catch (error) {
    return serverError(error);
  }
}

export async function PUT(request: NextRequest) {
  const userId = await requireApiUser();
  if (!userId) return unauthorized();

  const parsed = settingsUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);

  try {
    const settings = await updateSettings(userId, parsed.data);
    return settings ? NextResponse.json({ settings }) : notFound("Settings");
  } catch (error) {
    return serverError(error);
  }
}
