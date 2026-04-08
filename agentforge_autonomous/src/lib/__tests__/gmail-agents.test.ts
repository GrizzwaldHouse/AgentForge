import { describe, it, expect, beforeEach } from "vitest";
import {
  ClassificationAgent,
  PriorityAgent,
  GmailResponseAgent,
  type GmailMessage,
} from "@/agents/gmail";
import { killSwitch, approvalService } from "@/safety";

function makeEmail(overrides: Partial<GmailMessage> = {}): GmailMessage {
  return {
    messageId: "msg-1",
    threadId: "thread-1",
    from: "sender@example.com",
    to: ["me@example.com"],
    subject: "Test email",
    body: "This is a test email body.",
    timestamp: Date.now(),
    ...overrides,
  };
}

describe("ClassificationAgent", () => {
  const agent = new ClassificationAgent();

  it("returns success for valid email", async () => {
    const result = await agent.execute({
      taskId: "task-1",
      context: { email: makeEmail() },
    });
    expect(result.success).toBe(true);
    expect(result.data?.classification).toBeDefined();
  });

  it("returns failure when email is missing", async () => {
    const result = await agent.execute({
      taskId: "task-1",
      context: {},
    });
    expect(result.success).toBe(false);
  });

  it("detects newsletter via heuristic", async () => {
    const result = await agent.execute({
      taskId: "task-1",
      context: {
        email: makeEmail({
          subject: "Weekly newsletter digest",
          body: "Click here to unsubscribe",
        }),
      },
    });
    expect(result.data?.classification.labels).toContain("newsletter");
  });

  it("detects recruiter emails", async () => {
    const result = await agent.execute({
      taskId: "task-1",
      context: {
        email: makeEmail({
          subject: "Exciting opportunity",
          body: "I'm a recruiter with a job opening for you.",
        }),
      },
    });
    expect(result.data?.classification.labels).toContain("recruiter");
  });

  it("detects transactional emails", async () => {
    const result = await agent.execute({
      taskId: "task-1",
      context: {
        email: makeEmail({
          subject: "Order confirmation",
          body: "Your order #12345 has shipped. Invoice attached.",
        }),
      },
    });
    expect(result.data?.classification.labels).toContain("transactional");
  });
});

describe("PriorityAgent", () => {
  const agent = new PriorityAgent();

  it("returns failure when email is missing", async () => {
    const result = await agent.execute({
      taskId: "task-1",
      context: {},
    });
    expect(result.success).toBe(false);
  });

  it("assigns high priority to urgent emails", async () => {
    const result = await agent.execute({
      taskId: "task-1",
      context: {
        email: makeEmail({
          subject: "URGENT: server down",
          body: "Critical issue needs immediate attention",
        }),
      },
    });
    expect(["urgent", "high"]).toContain(result.data?.priority.priority);
  });

  it("assigns low priority to promotional content", async () => {
    const result = await agent.execute({
      taskId: "task-1",
      context: {
        email: makeEmail({
          subject: "50% off sale!",
          body: "Limited time discount on all items",
        }),
        classification: { labels: ["promotional"], confidence: 0.9 },
      },
    });
    expect(["low", "normal"]).toContain(result.data?.priority.priority);
  });

  it("scores are clamped between 0-100", async () => {
    const result = await agent.execute({
      taskId: "task-1",
      context: { email: makeEmail() },
    });
    const score = result.data?.priority.score;
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe("GmailResponseAgent", () => {
  beforeEach(() => {
    killSwitch.deactivate();
    approvalService.clear();
  });

  const agent = new GmailResponseAgent();

  it("returns failure when email is missing", async () => {
    const result = await agent.execute({
      taskId: "task-1",
      context: {},
    });
    expect(result.success).toBe(false);
  });

  it("generates a draft for normal email", async () => {
    const result = await agent.execute({
      taskId: "task-1",
      context: { email: makeEmail() },
    });
    expect(result.success).toBe(true);
    expect(result.data?.draft).toBeDefined();
    expect(result.data?.draft.draft.length).toBeGreaterThan(0);
  });

  it("skips drafting for spam", async () => {
    const result = await agent.execute({
      taskId: "task-1",
      context: {
        email: makeEmail(),
        classification: { labels: ["spam"], confidence: 0.9 },
      },
    });
    expect(result.data?.skipped).toBe(true);
    expect(result.data?.draft).toBeNull();
  });

  it("skips drafting for low priority", async () => {
    const result = await agent.execute({
      taskId: "task-1",
      context: {
        email: makeEmail(),
        priority: { priority: "low", score: 10, reason: "" },
      },
    });
    expect(result.data?.skipped).toBe(true);
  });

  it("safety guard blocks draft when kill switch active", async () => {
    killSwitch.activate("test");
    const result = await agent.execute({
      taskId: "task-1",
      context: { email: makeEmail() },
    });
    expect(result.data?.safety?.allowed).toBe(false);
    killSwitch.deactivate();
  });
});
