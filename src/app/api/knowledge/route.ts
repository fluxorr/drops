import { NextResponse } from "next/server";

import { listConcepts } from "@/database/repositories/concepts";
import { requireApiUser, serverError, unauthorized } from "@/lib/api";

export async function GET() {
  const userId = await requireApiUser();
  if (!userId) return unauthorized();

  try {
    const concepts = await listConcepts(userId);
    const averageKnowledge = concepts.length
      ? Math.round(concepts.reduce((total, concept) => total + concept.knowledgeScore, 0) / concepts.length)
      : 0;

    return NextResponse.json({
      summary: { concepts: concepts.length, averageKnowledge },
      concepts,
    });
  } catch (error) {
    return serverError(error);
  }
}
