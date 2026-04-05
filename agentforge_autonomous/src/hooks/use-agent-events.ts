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
    connect();
    return () => {
      esRef.current?.close();
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
    };
  }, [connect]);

  const clearEvents = useCallback(() => setEvents([]), []);

  return { events, status, lastTimestamp, clearEvents };
}
