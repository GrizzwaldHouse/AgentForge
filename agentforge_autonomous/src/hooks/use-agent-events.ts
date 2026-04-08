"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { AgentEvent } from "@/core/events/types";

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

const MAX_EVENTS = 500;
const RECONNECT_MS = 3_000;

export function useAgentEvents() {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [lastTimestamp, setLastTimestamp] = useState<number | null>(null);
  const esRef = useRef<EventSource | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydratedRef = useRef(false);

  const connect = useCallback(() => {
    if (esRef.current) {
      esRef.current.close();
    }

    setStatus("connecting");
    const es = new EventSource("/api/agent/events");
    esRef.current = es;

    es.onopen = () => setStatus("connected");

    es.onmessage = (msg) => {
      try {
        const event: AgentEvent = JSON.parse(msg.data);
        setEvents((prev) => {
          const next = [...prev, event];
          return next.length > MAX_EVENTS ? next.slice(-MAX_EVENTS) : next;
        });
        setLastTimestamp(event.timestamp);
      } catch {
        // Ignore malformed messages
      }
    };

    es.onerror = () => {
      es.close();
      setStatus("disconnected");
      // Auto-reconnect
      reconnectRef.current = setTimeout(connect, RECONNECT_MS);
    };
  }, []);

  useEffect(() => {
    // Hydrate from last session before connecting to SSE
    if (!hydratedRef.current) {
      hydratedRef.current = true;
      fetch("/api/agent/last-session")
        .then((res) => res.json())
        .then((saved: AgentEvent[]) => {
          if (Array.isArray(saved) && saved.length > 0) {
            setEvents(saved.slice(-MAX_EVENTS));
            const last = saved[saved.length - 1];
            if (last) setLastTimestamp(last.timestamp);
          }
        })
        .catch(() => {
          // No saved session — proceed normally
        })
        .finally(() => {
          connect();
        });
    } else {
      connect();
    }

    return () => {
      esRef.current?.close();
      esRef.current = null;
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
    };
  }, [connect]);

  const clearEvents = useCallback(() => setEvents([]), []);

  return { events, status, lastTimestamp, clearEvents };
}
