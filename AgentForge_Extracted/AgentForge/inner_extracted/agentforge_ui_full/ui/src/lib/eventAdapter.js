
export function connectEventStream(onEvent) {
  const ws = new WebSocket("ws://localhost:7842/ws");
  ws.onmessage = (msg) => {
    const data = JSON.parse(msg.data);
    onEvent(data);
  };
}
