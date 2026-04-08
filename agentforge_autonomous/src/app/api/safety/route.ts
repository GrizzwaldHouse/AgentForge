/**
 * Safety management API — kill switch, pending approvals, audit log.
 *
 * GET  /api/safety         - returns current kill switch state + audit summary
 * POST /api/safety         - { action: "kill" | "resume" | "approve" | "reject", actionId?, reason? }
 */

import { NextRequest, NextResponse } from "next/server";
import {
  killSwitch,
  approvalService,
  auditLogger,
} from "@/safety";
import { sanitizeString } from "@/lib/sanitize";

export async function GET() {
  return NextResponse.json({
    killSwitch: killSwitch.getStatus(),
    pendingApprovals: approvalService.getPending(),
    recentAudit: auditLogger.getAll().slice(-50),
  });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      { error: "Request body must be a JSON object" },
      { status: 400 }
    );
  }

  const data = body as Record<string, unknown>;
  const action = typeof data.action === "string" ? data.action : "";

  switch (action) {
    case "kill": {
      const reason = sanitizeString(data.reason).slice(0, 500) || "manual";
      killSwitch.activate(reason);
      return NextResponse.json({
        status: "killed",
        killSwitch: killSwitch.getStatus(),
      });
    }

    case "resume": {
      killSwitch.deactivate();
      return NextResponse.json({
        status: "resumed",
        killSwitch: killSwitch.getStatus(),
      });
    }

    case "approve": {
      const actionId = sanitizeString(data.actionId).slice(0, 200);
      if (!actionId) {
        return NextResponse.json(
          { error: "actionId required" },
          { status: 400 }
        );
      }
      const ok = approvalService.approve(actionId);
      return NextResponse.json({
        status: ok ? "approved" : "not_found",
        actionId,
      });
    }

    case "reject": {
      const actionId = sanitizeString(data.actionId).slice(0, 200);
      if (!actionId) {
        return NextResponse.json(
          { error: "actionId required" },
          { status: 400 }
        );
      }
      const ok = approvalService.reject(actionId);
      return NextResponse.json({
        status: ok ? "rejected" : "not_found",
        actionId,
      });
    }

    default:
      return NextResponse.json(
        {
          error: `Invalid action: ${action}. Expected "kill" | "resume" | "approve" | "reject"`,
        },
        { status: 400 }
      );
  }
}
