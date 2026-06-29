import { describe, expect, it } from "vitest";

import { readRemoteDatabaseEnv } from "./env";

describe("readRemoteDatabaseEnv", () => {
  it("accepts a remote libSQL database", () => {
    expect(
      readRemoteDatabaseEnv({
        TURSO_DATABASE_URL: "libsql://drops-example.turso.io",
        TURSO_AUTH_TOKEN: "secret-token",
      }),
    ).toEqual({
      TURSO_DATABASE_URL: "libsql://drops-example.turso.io",
      TURSO_AUTH_TOKEN: "secret-token",
    });
  });

  it.each(["file:local.db", ":memory:", "sqlite://local.db"])(
    "rejects local database target %s",
    (url) => {
      expect(
        readRemoteDatabaseEnv({ TURSO_DATABASE_URL: url, TURSO_AUTH_TOKEN: "token" }),
      ).toBeNull();
    },
  );
});
