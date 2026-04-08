import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import type { AgentEvent } from "./types";

const DATA_DIR = join(process.cwd(), "data");
const LAST_SESSION_PATH = join(DATA_DIR, "last-session.json");
const MAX_SESSION_EVENTS = 1000;
const DEBOUNCE_MS = 500;

/**
 * Subscribes to the event bus and persists session events to disk.
 * Separated from AgentEventBus to maintain single-responsibility.
 */
export class SessionPersistence {
  private sessionEvents: AgentEvent[] = [];
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  handle = (event: AgentEvent): void => {
    if (event.type === "session:start") {
      this.sessionEvents = [event];
    } else {
      this.sessionEvents.push(event);
      if (this.sessionEvents.length > MAX_SESSION_EVENTS) {
        this.sessionEvents = this.sessionEvents.slice(-MAX_SESSION_EVENTS);
      }
    }

    // Debounce disk writes — coalesce rapid event bursts
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null;
      this.writeToDisk();
    }, DEBOUNCE_MS);
  };

  private async writeToDisk(): Promise<void> {
    try {
      await mkdir(DATA_DIR, { recursive: true });
      // Strip stack traces before persisting — avoid leaking internals
      const sanitized = this.sessionEvents.map((e) => {
        if (e.type === "agent:error" && "stack" in e) {
          const { stack: _, ...rest } = e;
          return rest;
        }
        return e;
      });
      await writeFile(LAST_SESSION_PATH, JSON.stringify(sanitized), "utf-8");
    } catch {
      // Best-effort persistence — do not crash the application
    }
  }
}
