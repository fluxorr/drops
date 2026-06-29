import type { GeneratedLesson, LessonGenerationContext } from "./types";

export interface LessonProvider {
  readonly name: string;
  generateLesson(context: LessonGenerationContext): Promise<GeneratedLesson>;
}

export class LessonGenerationError extends Error {
  constructor(
    message: string,
    readonly provider: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "LessonGenerationError";
  }
}

export async function generateLesson(
  context: LessonGenerationContext,
  provider: LessonProvider,
): Promise<GeneratedLesson> {
  return provider.generateLesson(context);
}
