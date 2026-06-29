import { NextResponse } from "next/server";

import { listConcepts } from "@/database/repositories/concepts";
import { requireApiUser, serverError, unauthorized } from "@/lib/api";

export async function GET() {
  const userId = await requireApiUser();
  if (!userId) return unauthorized();

  try {
    return NextResponse.json({ concepts: await listConcepts(userId) });
  } catch (error) {
    return serverError(error);
  }
}
