/**
 * AuditLogger — structured JSON logging for all safety-gated actions.
 * In-memory ring buffer (last 1000 entries) for traceability.
 */

import type { AuditEntry } from "./types";

const MAX_ENTRIES = 1000;

class AuditLoggerImpl {
  private entries: AuditEntry[] = [];

  log(entry: Omit<AuditEntry, "timestamp">): void {
    const fullEntry: AuditEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    };
    this.entries.push(fullEntry);

    // Ring buffer — drop oldest entries
    if (this.entries.length > MAX_ENTRIES) {
      this.entries.shift();
    }

    // Structured console output for external observability
    console.log(`[safety-audit] ${JSON.stringify(fullEntry)}`);
  }

  getAll(): AuditEntry[] {
    return [...this.entries];
  }

  getByAgent(agentId: string): AuditEntry[] {
    return this.entries.filter((e) => e.agentId === agentId);
  }

  getByStatus(status: AuditEntry["status"]): AuditEntry[] {
    return this.entries.filter((e) => e.status === status);
  }

  clear(): void {
    this.entries = [];
  }
}

// Singleton instance
export const auditLogger = new AuditLoggerImpl();
