export interface RuntimeConfig {
  eventBus: {
    type: "sse" | "ws" | "memory";
    url: string;
  };
  graph: {
    largeThreshold: number;
  };
}

export const defaultConfig: RuntimeConfig = {
  eventBus: {
    type: "ws",
    url: "ws://localhost:4000"
  },
  graph: {
    largeThreshold: 5000
  }
};