
export interface Transition {
  target: string;
  actions: string[];
}

export interface StateConfig {
  on: Record<string, Transition>;
}

export class OrchestratorEngine {
  constructor(private config: Record<string, StateConfig>) {}

  transition(state: string, eventType: string) {
    const stateDef = this.config[state];
    return stateDef?.on[eventType];
  }
}
