import { NextRequest, NextResponse } from "next/server";

import { expandInterest } from "@/ai/subtopics";
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
    const { name, weight, pinned } = parsed.data;

    let subtopics: string[] | undefined;

    try {
      subtopics = await expandInterest(name);
      console.log(`[interests] Expanded "${name}" into ${subtopics.length} sub-topics: ${subtopics.join(", ")}`);
    } catch (e) {
      console.warn(`[interests] Failed to expand "${name}", saving as-is:`, e);
    }

    const interest = await saveInterest(userId, {
      name,
      weight: weight ?? 70,
      pinned: pinned ?? false,
      subtopics,
    });

    return NextResponse.json({ interest, subtopics }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
