import { NextRequest, NextResponse } from "next/server";
import { getAll, addApplication } from "@/job-system/store";
import { validateJobApplicationCreate } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  try {
    const applications = getAll();
    return NextResponse.json(applications);
  } catch {
    return NextResponse.json(
      { error: "Failed to retrieve applications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validation = validateJobApplicationCreate(body);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    const newApp = addApplication(validation.data!);
    return NextResponse.json(newApp, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
}
