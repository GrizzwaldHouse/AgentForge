"use client";

import { useEffect, useRef, useState } from "react";
import { WebSocketEventBus } from "@agentforge/event-bus";
import { CytoscapeEngine, SigmaEngine } from "@agentforge/graph-engine";
import { defaultConfig } from "@agentforge/config";
import { GraphNode, GraphEdge, SystemEvent } from "@agentforge/contracts";

export default function Page() {
  const [logs, setLogs] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<any>(null);

  useEffect(() => {
    const bus = new WebSocketEventBus(defaultConfig.eventBus.url);
    bus.connect();

    bus.subscribe("log.emitted", (e: SystemEvent) => {
      setLogs((prev) => [JSON.stringify(e.payload), ...prev].slice(0, 50));
    });

    bus.subscribe("graph.updated", (e: any) => {
      const { nodes, edges } = e.payload as { nodes: GraphNode[]; edges: GraphEdge[] };
      if (!engineRef.current && containerRef.current) {
        const useSigma = nodes.length > defaultConfig.graph.largeThreshold;
        engineRef.current = useSigma ? new SigmaEngine() : new CytoscapeEngine();
        engineRef.current.initialize(containerRef.current);
      }
      engineRef.current.update(nodes, edges);
    });

    return () => {
      bus.disconnect();
      engineRef.current?.destroy?.();
    };
  }, []);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", height: "100vh" }}>
      <div ref={containerRef} />
      <div style={{ overflow: "auto", borderLeft: "1px solid #ccc" }}>
        <h3>Logs</h3>
        {logs.map((l, i) => (
          <pre key={i}>{l}</pre>
        ))}
      </div>
    </div>
  );
}