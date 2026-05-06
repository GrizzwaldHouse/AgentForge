export type LogLevel = "ERROR" | "WARN" | "INFO" | "DEBUG";

export class Logger {
  log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
    const entry = { level, message, meta, ts: new Date().toISOString() };
    console.log(JSON.stringify(entry));
  }
}