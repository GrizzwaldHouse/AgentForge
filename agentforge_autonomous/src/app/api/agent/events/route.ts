import { agentEventBus } from "@/core/events/agent-event-bus";
import { SSE_HEARTBEAT_MS } from "@/lib/constants";
import type { AgentEvent } from "@/core/events/types";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const encoder = new TextEncoder();
  let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  let subscriptionId: string | null = null;

  const stream = new ReadableStream({
    start(controller) {
      // Send recent events as catch-up
      const recent = agentEventBus.getRecentEvents();
      for (const event of recent) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
        );
      }

      // Subscribe to new events
      subscriptionId = agentEventBus.subscribe((event: AgentEvent) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
          );
        } catch {
          // Stream closed
          if (subscriptionId) agentEventBus.unsubscribe(subscriptionId);
        }
      });

      // Heartbeat to keep connection alive
      heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          if (heartbeatInterval) clearInterval(heartbeatInterval);
          if (subscriptionId) agentEventBus.unsubscribe(subscriptionId);
        }
      }, SSE_HEARTBEAT_MS);
    },
    cancel() {
      // Cleanup when client disconnects
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      if (subscriptionId) agentEventBus.unsubscribe(subscriptionId);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
