import { NextRequest, NextResponse } from "next/server";
import { generateCoverLetter } from "@/job-system/cover-letter-generator";
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

  const companyValidation = validateString(data.company, "company", 200);
  if (!companyValidation.valid) {
    return NextResponse.json({ error: companyValidation.error }, { status: 400 });
  }

  const roleValidation = validateString(data.role, "role", 200);
  if (!roleValidation.valid) {
    return NextResponse.json({ error: roleValidation.error }, { status: 400 });
  }

  const descValidation = validateString(data.jobDescription, "jobDescription", 10000);
  if (!descValidation.valid) {
    return NextResponse.json({ error: descValidation.error }, { status: 400 });
  }

  const variantValidation = validateResumeVariant(data.variant);
  if (!variantValidation.valid) {
    return NextResponse.json({ error: variantValidation.error }, { status: 400 });
  }

  try {
    const coverLetter = generateCoverLetter(
      companyValidation.value!,
      roleValidation.value!,
      descValidation.value!,
      variantValidation.value!
    );
    return NextResponse.json({ coverLetter });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate cover letter" },
      { status: 500 }
    );
  }
}
