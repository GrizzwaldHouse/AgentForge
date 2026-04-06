// Trace ID generation and propagation for task execution

let traceCounter = 0;

export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  startedAt: number;
}

export function createTraceId(): string {
  return `trace_${Date.now()}_${++traceCounter}`;
}

export function createSpanId(): string {
  return `span_${Date.now()}_${++traceCounter}`;
}

export function createTraceContext(parentSpanId?: string): TraceContext {
  return {
    traceId: createTraceId(),
    spanId: createSpanId(),
    parentSpanId,
    startedAt: Date.now(),
  };
}

export function childSpan(parent: TraceContext): TraceContext {
  return {
    traceId: parent.traceId,
    spanId: createSpanId(),
    parentSpanId: parent.spanId,
    startedAt: Date.now(),
  };
}
