export type BackendMode = "auto" | "ollama" | "simulated" | "provider-chain";

/**
 * Starts an agent pipeline run by POSTing to /api/agent/run.
 * Shared by the dashboard header Run dialog and the inline CTA.
 * Errors are swallowed here — they surface through the event stream.
 */
export async function runPipeline(
  description: string,
  backend: BackendMode = "auto",
): Promise<void> {
  try {
    await fetch("/api/agent/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taskId: crypto.randomUUID(),
        context: { description },
        backend,
      }),
    });
  } catch {
    // Errors surface through the event stream
  }
}
