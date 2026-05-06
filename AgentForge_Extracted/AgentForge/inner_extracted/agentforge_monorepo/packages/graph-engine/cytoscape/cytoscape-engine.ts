import cytoscape from "cytoscape";
import { GraphEngine } from "../interface/graph-engine.interface";
import { GraphNode, GraphEdge } from "@agentforge/contracts";

export class CytoscapeEngine implements GraphEngine {
  private cy?: cytoscape.Core;

  initialize(container: HTMLElement): void {
    this.cy = cytoscape({
      container,
      elements: [],
      style: [{ selector: "node", style: { label: "data(label)" } }]
    });
  }

  render(nodes: GraphNode[], edges: GraphEdge[]): void {
    if (!this.cy) return;
    this.cy.json({
      elements: [
        ...nodes.map((n) => ({ data: n })),
        ...edges.map((e) => ({ data: e }))
      ]
    });
  }

  update(nodes: GraphNode[], edges: GraphEdge[]): void {
    this.render(nodes, edges);
  }

  destroy(): void {
    this.cy?.destroy();
  }
}