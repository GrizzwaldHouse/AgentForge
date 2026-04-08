/**
 * Input validation and sanitization utilities for API routes
 * Prevents XSS, injection attacks, and malformed data
 */

import type { ApplicationStatus, ResumeVariant } from "@/job-system/types";

// Valid enum values
const VALID_APPLICATION_STATUSES: ApplicationStatus[] = [
  "saved",
  "applied",
  "interview",
  "rejected",
  "offer",
  "accepted",
];

const VALID_RESUME_VARIANTS: ResumeVariant[] = [
  "game-dev",
  "full-stack",
  "ai-ml",
  "tools",
];

// Field length limits (prevent DoS via large payloads)
const MAX_LENGTHS = {
  company: 200,
  role: 200,
  url: 2000,
  source: 100,
  notes: 5000,
  jobDescription: 10000,
  resumeVariant: 20,
  status: 20,
  taskId: 100,
  backend: 20,
};

/**
 * Strip HTML tags and dangerous characters to prevent stored XSS
 * Removes < and > characters that could be used for tag injection
 */
export function sanitizeString(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }
  // Strip < and > to prevent HTML tag injection
  return value.replace(/[<>]/g, "").trim();
}

/**
 * Validate and sanitize a string field with length limit
 */
export function validateString(
  value: unknown,
  fieldName: string,
  maxLength: number,
  required = true
): { valid: boolean; value?: string; error?: string } {
  if (value === undefined || value === null || value === "") {
    if (required) {
      return { valid: false, error: `${fieldName} is required` };
    }
    return { valid: true, value: "" };
  }

  if (typeof value !== "string") {
    return { valid: false, error: `${fieldName} must be a string` };
  }

  const sanitized = sanitizeString(value);

  if (sanitized.length === 0 && required) {
    return { valid: false, error: `${fieldName} cannot be empty` };
  }

  if (sanitized.length > maxLength) {
    return {
      valid: false,
      error: `${fieldName} exceeds maximum length of ${maxLength} characters`,
    };
  }

  return { valid: true, value: sanitized };
}

/**
 * Validate URL format and length
 */
export function validateUrl(
  value: unknown,
  required = true
): { valid: boolean; value?: string; error?: string } {
  const stringResult = validateString(value, "url", MAX_LENGTHS.url, required);
  if (!stringResult.valid || !stringResult.value) {
    return stringResult;
  }

  // Basic URL format check
  try {
    new URL(stringResult.value);
    return { valid: true, value: stringResult.value };
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }
}

/**
 * Validate application status enum
 */
export function validateStatus(
  value: unknown
): { valid: boolean; value?: ApplicationStatus; error?: string } {
  if (typeof value !== "string") {
    return { valid: false, error: "status must be a string" };
  }

  if (!VALID_APPLICATION_STATUSES.includes(value as ApplicationStatus)) {
    return {
      valid: false,
      error: `Invalid status. Must be one of: ${VALID_APPLICATION_STATUSES.join(", ")}`,
    };
  }

  return { valid: true, value: value as ApplicationStatus };
}

/**
 * Validate resume variant enum
 */
export function validateResumeVariant(
  value: unknown
): { valid: boolean; value?: ResumeVariant; error?: string } {
  if (typeof value !== "string") {
    return { valid: false, error: "resumeVariant must be a string" };
  }

  if (!VALID_RESUME_VARIANTS.includes(value as ResumeVariant)) {
    return {
      valid: false,
      error: `Invalid variant. Must be one of: ${VALID_RESUME_VARIANTS.join(", ")}`,
    };
  }

  return { valid: true, value: value as ResumeVariant };
}

/**
 * Validate UUID format (for ID parameters)
 */
export function validateUUID(value: unknown): { valid: boolean; error?: string } {
  if (typeof value !== "string") {
    return { valid: false, error: "ID must be a string" };
  }

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(value)) {
    return { valid: false, error: "Invalid ID format" };
  }

  return { valid: true };
}

/**
 * Validate ISO date string
 */
export function validateISODate(
  value: unknown,
  required = false
): { valid: boolean; value?: string | null; error?: string } {
  if (value === undefined || value === null || value === "") {
    if (required) {
      return { valid: false, error: "Date is required" };
    }
    return { valid: true, value: null };
  }

  if (typeof value !== "string") {
    return { valid: false, error: "Date must be a string" };
  }

  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return { valid: false, error: "Invalid date format" };
  }

  return { valid: true, value: value };
}

/**
 * Validate and sanitize job application creation payload
 */
export function validateJobApplicationCreate(body: unknown): {
  valid: boolean;
  data?: {
    company: string;
    role: string;
    url: string;
    status: ApplicationStatus;
    appliedAt: string | null;
    source: string;
    resumeVariant: ResumeVariant;
    notes: string;
  };
  error?: string;
} {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return { valid: false, error: "Request body must be a JSON object" };
  }

  const data = body as Record<string, unknown>;

  // Validate required fields
  const companyResult = validateString(data.company, "company", MAX_LENGTHS.company);
  if (!companyResult.valid) {
    return { valid: false, error: companyResult.error };
  }

  const roleResult = validateString(data.role, "role", MAX_LENGTHS.role);
  if (!roleResult.valid) {
    return { valid: false, error: roleResult.error };
  }

  const urlResult = validateUrl(data.url);
  if (!urlResult.valid) {
    return { valid: false, error: urlResult.error };
  }

  const statusResult = validateStatus(data.status);
  if (!statusResult.valid) {
    return { valid: false, error: statusResult.error };
  }

  const sourceResult = validateString(data.source, "source", MAX_LENGTHS.source);
  if (!sourceResult.valid) {
    return { valid: false, error: sourceResult.error };
  }

  const variantResult = validateResumeVariant(data.resumeVariant);
  if (!variantResult.valid) {
    return { valid: false, error: variantResult.error };
  }

  // Validate optional fields
  const appliedAtResult = validateISODate(data.appliedAt);
  if (!appliedAtResult.valid) {
    return { valid: false, error: appliedAtResult.error };
  }

  const notesResult = validateString(data.notes, "notes", MAX_LENGTHS.notes, false);
  if (!notesResult.valid) {
    return { valid: false, error: notesResult.error };
  }

  return {
    valid: true,
    data: {
      company: companyResult.value!,
      role: roleResult.value!,
      url: urlResult.value!,
      status: statusResult.value!,
      appliedAt: appliedAtResult.value ?? null,
      source: sourceResult.value!,
      resumeVariant: variantResult.value!,
      notes: notesResult.value ?? "",
    },
  };
}

/**
 * Validate and sanitize job application update payload
 */
export function validateJobApplicationUpdate(body: unknown): {
  valid: boolean;
  data?: Partial<{
    company: string;
    role: string;
    url: string;
    status: ApplicationStatus;
    appliedAt: string | null;
    source: string;
    resumeVariant: ResumeVariant;
    notes: string;
  }>;
  error?: string;
} {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return { valid: false, error: "Request body must be a JSON object" };
  }

  const data = body as Record<string, unknown>;
  const updates: Record<string, unknown> = {};

  // Validate each field if present
  if ("company" in data) {
    const result = validateString(data.company, "company", MAX_LENGTHS.company);
    if (!result.valid) return { valid: false, error: result.error };
    updates.company = result.value;
  }

  if ("role" in data) {
    const result = validateString(data.role, "role", MAX_LENGTHS.role);
    if (!result.valid) return { valid: false, error: result.error };
    updates.role = result.value;
  }

  if ("url" in data) {
    const result = validateUrl(data.url);
    if (!result.valid) return { valid: false, error: result.error };
    updates.url = result.value;
  }

  if ("status" in data) {
    const result = validateStatus(data.status);
    if (!result.valid) return { valid: false, error: result.error };
    updates.status = result.value;
  }

  if ("appliedAt" in data) {
    const result = validateISODate(data.appliedAt);
    if (!result.valid) return { valid: false, error: result.error };
    updates.appliedAt = result.value;
  }

  if ("source" in data) {
    const result = validateString(data.source, "source", MAX_LENGTHS.source);
    if (!result.valid) return { valid: false, error: result.error };
    updates.source = result.value;
  }

  if ("resumeVariant" in data) {
    const result = validateResumeVariant(data.resumeVariant);
    if (!result.valid) return { valid: false, error: result.error };
    updates.resumeVariant = result.value;
  }

  if ("notes" in data) {
    const result = validateString(data.notes, "notes", MAX_LENGTHS.notes, false);
    if (!result.valid) return { valid: false, error: result.error };
    updates.notes = result.value;
  }

  return { valid: true, data: updates };
}
