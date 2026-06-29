import { NextRequest, NextResponse } from "next/server";

import { listInterests, saveInterest } from "@/database/repositories/interests";
import { requireApiUser, serverError, unauthorized, validationError } from "@/lib/api";
import { interestInputSchema } from "@/lib/validation";

export async function GET() {
  const userId = await requireApiUser();
  if (!userId) return unauthorized();

  try {
    return NextResponse.json({ interests: await listInterests(userId) });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: NextRequest) {
  const userId = await requireApiUser();
  if (!userId) return unauthorized();

  const parsed = interestInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);

  try {
    const interest = await saveInterest(userId, parsed.data);
    return NextResponse.json({ interest }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
