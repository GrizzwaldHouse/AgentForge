import { NextRequest, NextResponse } from "next/server";
import { generateResume } from "@/job-system/resume-generator";
import { validateResumeVariant, validateString } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      { error: "Request body must be a JSON object" },
      { status: 400 }
    );
  }

  const data = body as Record<string, unknown>;

  const variantValidation = validateResumeVariant(data.variant);
  if (!variantValidation.valid) {
    return NextResponse.json({ error: variantValidation.error }, { status: 400 });
  }

  // jobDescription is optional but must be validated if present
  let jobDescription: string | undefined;
  if ("jobDescription" in data && data.jobDescription !== undefined) {
    const descValidation = validateString(
      data.jobDescription,
      "jobDescription",
      10000,
      false
    );
    if (!descValidation.valid) {
      return NextResponse.json({ error: descValidation.error }, { status: 400 });
    }
    jobDescription = descValidation.value;
  }

  try {
    const resume = generateResume(variantValidation.value!, jobDescription);
    return NextResponse.json(resume);
  } catch {
    return NextResponse.json(
      { error: "Failed to generate resume" },
      { status: 500 }
    );
  }
}
