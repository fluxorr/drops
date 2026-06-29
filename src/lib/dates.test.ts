import { describe, expect, it } from "vitest";

import { formatLedgerDate } from "./dates";

describe("formatLedgerDate", () => {
  it("uses India time by default", () => {
    expect(formatLedgerDate("2026-06-28T20:00:00.000Z")).toBe("29 June 2026");
  });

  it("rejects invalid values", () => {
    expect(() => formatLedgerDate("not-a-date")).toThrow("Invalid ledger date");
  });
});
