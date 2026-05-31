// src/lib/__tests__/revenue-api.test.ts
// Purpose: Unit tests for revenue CSV parser
// Dependencies: revenue-parser.ts
// Integration points: /api/badgerheart/revenue route

import { describe, it, expect } from "vitest";
import { parseRevenueCsv, getCurrentMonthNet } from "@/lib/revenue-parser";

const SAMPLE_CSV = `Month,Listing,Units Sold,Revenue USD,Platform Cut,Net USD,Notes
2026-05,GHObjectPool,3,59.97,7.20,52.77,first sales
2026-05,Elemental Kit,1,49.99,6.00,43.99,launch
2026-04,GHObjectPool,1,19.99,2.40,17.59,`;

describe("parseRevenueCsv", () => {
  it("returns an array of revenue records", () => {
    const records = parseRevenueCsv(SAMPLE_CSV);
    expect(records).toHaveLength(3);
  });

  it("parses numeric fields correctly", () => {
    const records = parseRevenueCsv(SAMPLE_CSV);
    expect(records[0].netUsd).toBe(52.77);
    expect(records[0].revenueUsd).toBe(59.97);
    expect(records[0].unitsSold).toBe(3);
  });

  it("parses month and listing fields", () => {
    const records = parseRevenueCsv(SAMPLE_CSV);
    expect(records[0].month).toBe("2026-05");
    expect(records[0].listing).toBe("GHObjectPool");
  });

  it("returns empty array for empty CSV", () => {
    const records = parseRevenueCsv("Month,Listing,Units Sold,Revenue USD,Platform Cut,Net USD,Notes\n");
    expect(records).toHaveLength(0);
  });
});

describe("getCurrentMonthNet", () => {
  it("sums net USD for the given month", () => {
    const records = parseRevenueCsv(SAMPLE_CSV);
    const total = getCurrentMonthNet(records, "2026-05");
    expect(total).toBeCloseTo(52.77 + 43.99, 2);
  });

  it("returns 0 when no records match the month", () => {
    const records = parseRevenueCsv(SAMPLE_CSV);
    expect(getCurrentMonthNet(records, "2026-03")).toBe(0);
  });
});
