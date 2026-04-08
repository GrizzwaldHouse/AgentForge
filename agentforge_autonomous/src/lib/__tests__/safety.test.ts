import { describe, it, expect, beforeEach } from "vitest";
import {
  killSwitch,
  evaluatePolicy,
  approvalService,
  auditLogger,
  guardAction,
  DEFAULT_POLICY,
  type SafetyAction,
  type PolicyConfig,
} from "@/safety";

function makeAction(overrides: Partial<SafetyAction> = {}): SafetyAction {
  return {
    id: `action-${Math.random()}`,
    type: "SEND_EMAIL",
    agentId: "test-agent",
    payload: { recipients: ["user@example.com"], body: "Hello" },
    timestamp: Date.now(),
    ...overrides,
  };
}

describe("KillSwitch", () => {
  beforeEach(() => {
    killSwitch.deactivate();
  });

  it("starts inactive", () => {
    expect(killSwitch.isActive()).toBe(false);
  });

  it("activates with reason", () => {
    killSwitch.activate("test reason");
    expect(killSwitch.isActive()).toBe(true);
    expect(killSwitch.getStatus().reason).toBe("test reason");
  });

  it("deactivates and clears state", () => {
    killSwitch.activate("test");
    killSwitch.deactivate();
    expect(killSwitch.isActive()).toBe(false);
    expect(killSwitch.getStatus().reason).toBeUndefined();
  });
});

describe("PolicyEngine", () => {
  it("allows normal email", () => {
    const action = makeAction();
    const result = evaluatePolicy(action);
    expect(result.decision).toBe("ALLOW");
  });

  it("blocks email exceeding max length", () => {
    const action = makeAction({
      payload: {
        recipients: ["user@example.com"],
        body: "x".repeat(20_000),
      },
    });
    const result = evaluatePolicy(action);
    expect(result.decision).toBe("BLOCK");
    expect(result.ruleId).toBe("max-message-length");
  });

  it("requires approval for too many recipients", () => {
    const action = makeAction({
      payload: {
        recipients: Array.from({ length: 10 }, (_, i) => `u${i}@example.com`),
        body: "Hello",
      },
    });
    const result = evaluatePolicy(action);
    expect(result.decision).toBe("REQUIRE_APPROVAL");
    expect(result.ruleId).toBe("max-recipients");
  });

  it("blocks email to blocked domain", () => {
    const config: PolicyConfig = {
      ...DEFAULT_POLICY,
      blockedDomains: ["evil.com"],
    };
    const action = makeAction({
      payload: { recipients: ["bad@evil.com"], body: "Hi" },
    });
    const result = evaluatePolicy(action, config);
    expect(result.decision).toBe("BLOCK");
    expect(result.ruleId).toBe("blocked-domain");
  });

  it("requires approval for external domain when allowlist set", () => {
    const config: PolicyConfig = {
      ...DEFAULT_POLICY,
      allowedDomains: ["company.com"],
    };
    const action = makeAction({
      payload: { recipients: ["external@other.com"], body: "Hi" },
    });
    const result = evaluatePolicy(action, config);
    expect(result.decision).toBe("REQUIRE_APPROVAL");
  });

  it("always requires approval for destructive actions", () => {
    const action = makeAction({ type: "DELETE_FILE", payload: {} });
    const result = evaluatePolicy(action);
    expect(result.decision).toBe("REQUIRE_APPROVAL");
  });
});

describe("ApprovalService", () => {
  beforeEach(() => {
    approvalService.clear();
  });

  it("creates pending approval", () => {
    const action = makeAction({ id: "approval-1" });
    const record = approvalService.request(action);
    expect(record.status).toBe("PENDING");
    expect(approvalService.isApproved("approval-1")).toBe(false);
  });

  it("approves pending request", () => {
    const action = makeAction({ id: "approval-2" });
    approvalService.request(action);
    expect(approvalService.approve("approval-2")).toBe(true);
    expect(approvalService.isApproved("approval-2")).toBe(true);
  });

  it("rejects pending request", () => {
    const action = makeAction({ id: "approval-3" });
    approvalService.request(action);
    expect(approvalService.reject("approval-3")).toBe(true);
    expect(approvalService.isApproved("approval-3")).toBe(false);
  });

  it("returns false for unknown actionId", () => {
    expect(approvalService.approve("never-requested")).toBe(false);
  });

  it("lists pending approvals", () => {
    approvalService.request(makeAction({ id: "p1" }));
    approvalService.request(makeAction({ id: "p2" }));
    approvalService.approve("p1");
    const pending = approvalService.getPending();
    expect(pending.length).toBe(1);
    expect(pending[0].actionId).toBe("p2");
  });
});

describe("SafetyGuard (integration)", () => {
  beforeEach(() => {
    killSwitch.deactivate();
    approvalService.clear();
    auditLogger.clear();
  });

  it("allows normal action", async () => {
    const result = await guardAction(makeAction());
    expect(result.allowed).toBe(true);
  });

  it("halts when kill switch is active", async () => {
    killSwitch.activate("emergency");
    const result = await guardAction(makeAction());
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("kill switch");
  });

  it("blocks policy violations", async () => {
    const action = makeAction({
      payload: { recipients: ["u@x.com"], body: "x".repeat(20_000) },
    });
    const result = await guardAction(action);
    expect(result.allowed).toBe(false);
  });

  it("requires approval for too many recipients", async () => {
    const action = makeAction({
      payload: {
        recipients: Array.from({ length: 10 }, (_, i) => `u${i}@x.com`),
        body: "Hi",
      },
    });
    const result = await guardAction(action);
    expect(result.allowed).toBe(false);
    expect(result.requiresApproval).toBe(true);
  });

  it("writes audit entries for blocked actions", async () => {
    auditLogger.clear();
    await guardAction(
      makeAction({
        payload: { recipients: ["u@x.com"], body: "x".repeat(20_000) },
      })
    );
    const entries = auditLogger.getAll();
    expect(entries.length).toBeGreaterThan(0);
    expect(entries[entries.length - 1].status).toBe("BLOCKED");
  });
});
