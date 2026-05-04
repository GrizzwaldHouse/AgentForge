import { SystemEvent } from "@agentforge/contracts";

export function isSystemEvent(obj: unknown): obj is SystemEvent {
  if (typeof obj !== "object" || obj === null) return false;
  const e = obj as Record<string, unknown>;
  return (
    typeof e.id === "string" &&
    typeof e.type === "string" &&
    typeof e.timestamp === "string" &&
    typeof e.schemaVersion === "string" &&
    typeof e.source === "string" &&
    typeof e.payload === "object"
  );
}