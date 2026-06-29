import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export async function requireApiUser() {
  const { userId } = await auth();
  return userId;
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function notFound(resource: string) {
  return NextResponse.json({ error: `${resource} not found` }, { status: 404 });
}

export function validationError(error: ZodError) {
  return NextResponse.json(
    { error: "Invalid request", fields: error.flatten().fieldErrors },
    { status: 400 },
  );
}

export function serverError(error: unknown) {
  console.error("API request failed", error);
  return NextResponse.json({ error: "Request failed" }, { status: 500 });
}
