import { z } from "zod";

const remoteDatabaseEnvSchema = z.object({
  TURSO_DATABASE_URL: z
    .string()
    .min(1, "TURSO_DATABASE_URL is required")
    .refine(
      (value) => value.startsWith("libsql://") || value.startsWith("https://"),
      "TURSO_DATABASE_URL must point to a remote libSQL database",
    ),
  TURSO_AUTH_TOKEN: z.string().min(1, "TURSO_AUTH_TOKEN is required"),
});

export type RemoteDatabaseEnv = z.infer<typeof remoteDatabaseEnvSchema>;

export function readRemoteDatabaseEnv(
  env: Record<string, string | undefined> = process.env,
): RemoteDatabaseEnv | null {
  const result = remoteDatabaseEnvSchema.safeParse(env);
  return result.success ? result.data : null;
}
