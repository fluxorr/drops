import { NextResponse } from "next/server";

import { removeInterest } from "@/database/repositories/interests";
import { notFound, requireApiUser, serverError, unauthorized } from "@/lib/api";

export async function DELETE(_request: Request, context: RouteContext<"/api/interests/[id]">) {
  const userId = await requireApiUser();
  if (!userId) return unauthorized();

  const { id } = await context.params;
  try {
    const interest = await removeInterest(userId, id);
    return interest ? NextResponse.json({ deleted: true }) : notFound("Interest");
  } catch (error) {
    return serverError(error);
  }
}
