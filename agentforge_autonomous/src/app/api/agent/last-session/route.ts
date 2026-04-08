import { readFile } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";

const LAST_SESSION_PATH = join(process.cwd(), "data", "last-session.json");

export async function GET(): Promise<Response> {
  try {
    const raw = await readFile(LAST_SESSION_PATH, "utf-8");
    const events = JSON.parse(raw);
    return NextResponse.json(events);
  } catch {
    // No previous session or unreadable — return empty array
    return NextResponse.json([]);
  }
}
