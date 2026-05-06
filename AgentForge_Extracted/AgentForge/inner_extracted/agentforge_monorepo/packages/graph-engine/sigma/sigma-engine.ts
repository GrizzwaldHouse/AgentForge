import Sigma from "sigma";
import { GraphEngine } from "../interface/graph-engine.interface";
import { GraphNode, GraphEdge } from "@agentforge/contracts";

export class SigmaEngine implements GraphEngine {
  private renderer?: Sigma;

  initialize(container: HTMLElement): void {
    this.renderer = new Sigma({ container } as any);
  }

  render(nodes: GraphNode[], edges: GraphEdge[]): void {
    if (!this.renderer) return;
    // Basic mapping; in production, normalize attributes for sigma
    (this.renderer as any).setGraph({ nodes, edges });
  }

  update(nodes: GraphNode[], edges: GraphEdge[]): void {
    this.render(nodes, edges);
  }

  destroy(): void {
    (this.renderer as any)?.kill?.();
  }
}