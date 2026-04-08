/**
 * KillSwitch — global hard stop for all agent actions.
 * When activated, all safety-gated actions are immediately blocked.
 */

class KillSwitchService {
  private active = false;
  private activatedAt?: number;
  private activatedReason?: string;

  activate(reason?: string): void {
    this.active = true;
    this.activatedAt = Date.now();
    this.activatedReason = reason;
  }

  deactivate(): void {
    this.active = false;
    this.activatedAt = undefined;
    this.activatedReason = undefined;
  }

  isActive(): boolean {
    return this.active;
  }

  getStatus(): { active: boolean; activatedAt?: number; reason?: string } {
    return {
      active: this.active,
      activatedAt: this.activatedAt,
      reason: this.activatedReason,
    };
  }
}

// Singleton instance
export const killSwitch = new KillSwitchService();
