import { NextResponse } from "next/server";
import { getWeeklyStats } from "@/job-system/store";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  try {
    const stats = getWeeklyStats();
    return NextResponse.json(stats);
  } catch {
    return NextResponse.json(
      { error: "Failed to retrieve stats" },
      { status: 500 }
    );
  }
}
