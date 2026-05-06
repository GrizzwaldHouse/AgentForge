import { WebSocketServer } from "ws";
import { isSystemEvent } from "@agentforge/validation";
import { SystemEvent } from "@agentforge/contracts";

const wss = new WebSocketServer({ port: 4000 });

wss.on("connection", (ws) => {
  ws.on("message", (data) => {
    try {
      const parsed = JSON.parse(data.toString());
      if (!isSystemEvent(parsed)) {
        ws.send(JSON.stringify({ error: "Invalid event schema" }));
        return;
      }
      const event = parsed as SystemEvent;
      // Echo/broadcast for now; in production, route to orchestrator
      wss.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(JSON.stringify(event));
        }
      });
    } catch (err) {
      ws.send(JSON.stringify({ error: "Malformed JSON" }));
    }
  });
});

console.log("WebSocket gateway running on ws://localhost:4000");