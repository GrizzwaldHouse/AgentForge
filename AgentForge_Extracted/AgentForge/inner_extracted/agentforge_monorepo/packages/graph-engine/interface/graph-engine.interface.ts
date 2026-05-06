import { GraphNode, GraphEdge } from "@agentforge/contracts";

export interface GraphEngine {
  initialize(container: HTMLElement): void;
  render(nodes: GraphNode[], edges: GraphEdge[]): void;
  update(nodes: GraphNode[], edges: GraphEdge[]): void;
  destroy(): void;
}