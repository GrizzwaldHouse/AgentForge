// src/lib/revenue-parser.ts
// Purpose: Parse revenue_tracker.csv into typed records for the dashboard widget
// Dependencies: none (pure functions, no I/O)
// Integration points: /api/badgerheart/revenue route, revenue-tracker-widget

export interface RevenueRecord {
  month: string;
  listing: string;
  unitsSold: number;
  revenueUsd: number;
  platformCut: number;
  netUsd: number;
  notes: string;
}

export function parseRevenueCsv(csv: string): RevenueRecord[] {
  const lines = csv.trim().split("\n");
  // Skip header line
  const dataLines = lines.slice(1).filter((l) => l.trim().length > 0);

  return dataLines.map((line) => {
    const [month, listing, unitsSold, revenueUsd, platformCut, netUsd, ...notesParts] = line.split(",");
    return {
      month: month.trim(),
      listing: listing.trim(),
      unitsSold: parseInt(unitsSold.trim(), 10),
      revenueUsd: parseFloat(revenueUsd.trim()),
      platformCut: parseFloat(platformCut.trim()),
      netUsd: parseFloat(netUsd.trim()),
      notes: notesParts.join(",").trim(),
    };
  });
}

// Sum net USD for a specific month (format: "YYYY-MM")
export function getCurrentMonthNet(records: RevenueRecord[], month: string): number {
  return records
    .filter((r) => r.month === month)
    .reduce((sum, r) => sum + r.netUsd, 0);
}

// Return the listing with the highest net USD in the given month
export function getTopListing(records: RevenueRecord[], month: string): RevenueRecord | null {
  const monthRecords = records.filter((r) => r.month === month);
  if (monthRecords.length === 0) return null;
  return monthRecords.reduce((best, r) => (r.netUsd > best.netUsd ? r : best));
}
