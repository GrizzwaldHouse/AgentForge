import { agentEventBus } from "@/core/events/agent-event-bus";
import { SSE_HEARTBEAT_MS } from "@/lib/constants";
import type { AgentEvent } from "@/core/events/types";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const encoder = new TextEncoder();

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
      const subId = agentEventBus.subscribe((event: AgentEvent) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
          );
        } catch {
          // Stream closed
          agentEventBus.unsubscribe(subId);
        }
      });

      // Heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          clearInterval(heartbeat);
          agentEventBus.unsubscribe(subId);
        }
      }, SSE_HEARTBEAT_MS);

      // Cleanup when stream is cancelled
      const originalCancel = stream.cancel?.bind(stream);
      stream.cancel = async (reason) => {
        clearInterval(heartbeat);
        agentEventBus.unsubscribe(subId);
        if (originalCancel) await originalCancel(reason);
      };
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
