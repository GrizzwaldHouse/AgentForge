// src/app/api/badgerheart/revenue/route.ts
// Purpose: Serve BadgerHeart FabStorefront revenue_tracker.csv as JSON
// Dependencies: fs (Node built-in), revenue-parser, agentEventBus
// Integration points: revenue-tracker-widget component

import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { parseRevenueCsv, getCurrentMonthNet, getTopListing } from "@/lib/revenue-parser";
import { agentEventBus } from "@/core/events/agent-event-bus";
import { createEventId } from "@/core/events/types";
import { EVENT_TYPES } from "@/lib/constants";

const REVENUE_CSV_PATH =
  "C:\\Users\\daley\\Projects\\BadgerHeart\\FabStorefront\\revenue_tracker.csv";
const REVENUE_TARGET_USD = 1000;

export async function GET() {
  try {
    const csv = readFileSync(REVENUE_CSV_PATH, "utf-8");
    const records = parseRevenueCsv(csv);

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const monthNet = getCurrentMonthNet(records, currentMonth);
    const topListing = getTopListing(records, currentMonth);

    const payload = {
      currentMonth,
      monthNet,
      targetUsd: REVENUE_TARGET_USD,
      progressPct: Math.min((monthNet / REVENUE_TARGET_USD) * 100, 100),
      topListing,
      records,
    };

    // Notify dashboard subscribers that revenue data was loaded
    agentEventBus.emit({
      id: createEventId(),
      type: EVENT_TYPES.AGENT_LOG,
      timestamp: Date.now(),
      sessionId: "system",
      agentId: "badgerheart-revenue",
      taskId: "TASK-006",
      level: "info",
      message: `badgerheart:revenue:updated month=${currentMonth} net=$${monthNet.toFixed(2)}`,
    });

    return NextResponse.json(payload);
  } catch {
    // Graceful degradation when CSV is missing
    return NextResponse.json(
      {
        currentMonth: "",
        monthNet: 0,
        targetUsd: REVENUE_TARGET_USD,
        progressPct: 0,
        topListing: null,
        records: [],
        offline: true,
      },
      { status: 200 }
    );
  }
}
