import { NextResponse } from "next/server";

import { expandInterest } from "@/ai/subtopics";
import { listConcepts } from "@/database/repositories/concepts";
import { listInterests, removeInterest, saveInterest } from "@/database/repositories/interests";
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

export async function PATCH(request: Request, context: RouteContext<"/api/interests/[id]">) {
  const userId = await requireApiUser();
  if (!userId) return unauthorized();

  const { id } = await context.params;

  try {
    const interests = await listInterests(userId);
    const interest = interests.find((i) => i.id === id);
    if (!interest) return notFound("Interest");

    const knownConcepts = await fetchKnownConcepts(userId, interest.name);
    const newSubtopics = await expandInterest(interest.name, knownConcepts);

    const updated = await saveInterest(userId, {
      name: interest.name,
      weight: interest.weight,
      pinned: interest.pinned,
      subtopics: newSubtopics,
    });

    return NextResponse.json({ interest: updated, subtopics: newSubtopics });
  } catch (error) {
    return serverError(error);
  }
}

async function fetchKnownConcepts(userId: string, interestName: string): Promise<string[]> {
  try {
    const concepts = await listConcepts(userId);
    const norm = interestName.toLocaleLowerCase("en-IN");
    return concepts
      .filter((c) => c.normalizedName.includes(norm) || norm.includes(c.normalizedName))
      .filter((c) => c.knowledgeScore >= 80)
      .map((c) => c.name);
  } catch {
    return [];
  }
}
