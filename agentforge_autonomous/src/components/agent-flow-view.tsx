"use client";

import { AGENT_COLORS } from "@/lib/constants";

export type AgentFlowStatus = "idle" | "active" | "completed" | "error";

interface AgentFlowNode {
  id: string;
  label: string;
  status: AgentFlowStatus;
}

interface AgentFlowViewProps {
  agentIds: string[];
  completedIds: Set<string>;
  activeId: string | null;
  errorIds: Set<string>;
  hasRun?: boolean;
}

const AGENT_LABELS: Record<string, string> = {
  planner: "Plan",
  builder: "Build",
  reviewer: "Review",
  tester: "Test",
  learning: "Learn",
  context: "Cleanup",
};

function getStatus(
  id: string,
  completedIds: Set<string>,
  activeId: string | null,
  errorIds: Set<string>,
): AgentFlowStatus {
  if (errorIds.has(id)) return "error";
  if (id === activeId) return "active";
  if (completedIds.has(id)) return "completed";
  return "idle";
}

export function AgentFlowView({
  agentIds,
  completedIds,
  activeId,
  errorIds,
  hasRun = false,
}: AgentFlowViewProps) {
  const nodes: AgentFlowNode[] = agentIds.map((id) => ({
    id,
    label: AGENT_LABELS[id] ?? id,
    status: getStatus(id, completedIds, activeId, errorIds),
  }));

  const nodeWidth = 100;
  const nodeHeight = 40;
  const gap = 40;
  const totalWidth = nodes.length * nodeWidth + (nodes.length - 1) * gap;
  const viewBoxWidth = Math.max(totalWidth + 40, 600);
  const showReadyLabel = !hasRun;
  const viewBoxHeight = showReadyLabel ? 72 : 60;
  const startX = (viewBoxWidth - totalWidth) / 2;
  const centerY = showReadyLabel ? 26 : viewBoxHeight / 2;

  return (
    <div className="px-4 py-3 border-b border-[var(--border-color)]">
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        className="w-full h-auto"
        style={{ maxHeight: 60 }}
      >
        <defs>
          {/* Glow filter for active nodes */}
          <filter id="activeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Edges */}
        {nodes.map((node, i) => {
          if (i === 0) return null;
          const x1 = startX + (i - 1) * (nodeWidth + gap) + nodeWidth;
          const x2 = startX + i * (nodeWidth + gap);
          const prevNode = nodes[i - 1];
          const isCompleted =
            prevNode.status === "completed" || prevNode.status === "error";
          const edgeColor = isCompleted
            ? AGENT_COLORS[prevNode.id] ?? "var(--border-color)"
            : "var(--border-color)";

          return (
            <line
              key={`edge-${i}`}
              x1={x1}
              y1={centerY}
              x2={x2}
              y2={centerY}
              stroke={edgeColor}
              strokeWidth={2}
              strokeOpacity={isCompleted ? 0.7 : 0.3}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node, i) => {
          const x = startX + i * (nodeWidth + gap);
          const color = AGENT_COLORS[node.id] ?? "#4f8fff";
          const rx = 6;

          let fill = "var(--bg-tertiary)";
          let stroke = "var(--border-color)";
          let strokeWidth = 1.5;
          let textFill = "var(--text-secondary)";

          if (node.status === "active") {
            stroke = color;
            strokeWidth = 2;
            textFill = color;
          } else if (node.status === "completed") {
            fill = color;
            stroke = color;
            textFill = "#0a0a0f";
          } else if (node.status === "error") {
            stroke = "var(--accent-red)";
            strokeWidth = 2;
            textFill = "var(--accent-red)";
          }

          return (
            <g key={node.id}>
              {/* Main rect */}
              <rect
                x={x}
                y={centerY - nodeHeight / 2}
                width={nodeWidth}
                height={nodeHeight}
                rx={rx}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
                fillOpacity={node.status === "completed" ? 0.3 : 1}
              />
              {/* Active pulse with glow */}
              {node.status === "active" && (
                <>
                  <rect
                    x={x}
                    y={centerY - nodeHeight / 2}
                    width={nodeWidth}
                    height={nodeHeight}
                    rx={rx}
                    fill="none"
                    stroke={color}
                    strokeWidth={3}
                    opacity={0.6}
                    filter="url(#activeGlow)"
                  >
                    <animate
                      attributeName="opacity"
                      values="0.6;1;0.6"
                      dur="1s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="stroke-width"
                      values="3;4;3"
                      dur="1s"
                      repeatCount="indefinite"
                    />
                  </rect>
                </>
              )}
              {/* Label text */}
              <text
                x={x + nodeWidth / 2}
                y={centerY + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={textFill}
                fontSize={11}
                fontFamily="ui-monospace, SFMono-Regular, monospace"
                fontWeight={node.status === "active" ? 600 : 400}
              >
                {node.label}
              </text>
              {/* Status icon overlay */}
              {node.status === "completed" && (
                <text
                  x={x + nodeWidth - 10}
                  y={centerY - nodeHeight / 2 + 12}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#0a0a0f"
                  fontSize={10}
                  fontWeight={700}
                >
                  ✓
                </text>
              )}
              {node.status === "error" && (
                <text
                  x={x + nodeWidth - 10}
                  y={centerY - nodeHeight / 2 + 12}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="var(--accent-red)"
                  fontSize={10}
                  fontWeight={700}
                >
                  ✗
                </text>
              )}
              {/* "Ready" subtitle for idle nodes before first run */}
              {showReadyLabel && node.status === "idle" && (
                <text
                  x={x + nodeWidth / 2}
                  y={centerY + nodeHeight / 2 + 12}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="var(--text-secondary)"
                  fontSize={9}
                  fontFamily="ui-monospace, SFMono-Regular, monospace"
                  opacity={0.6}
                >
                  Ready
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
