import WebSocket from "ws";

const ws = new WebSocket("ws://localhost:4000");

ws.on("open", () => {
  setInterval(() => {
    ws.send(JSON.stringify({
      id: Math.random().toString(),
      type: "log.emitted",
      timestamp: new Date().toISOString(),
      source: "mock",
      schemaVersion: "1.0",
      payload: { level: "INFO", message: "Mock log" }
    }));

    ws.send(JSON.stringify({
      id: Math.random().toString(),
      type: "graph.updated",
      timestamp: new Date().toISOString(),
      source: "mock",
      schemaVersion: "1.0",
      payload: {
        nodes: [{ id: "1", label: "A", type: "node" }],
        edges: []
      }
    }));
  }, 1000);
});