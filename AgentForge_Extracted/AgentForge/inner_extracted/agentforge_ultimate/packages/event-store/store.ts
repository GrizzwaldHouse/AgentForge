
export class EventStore {
  private events: any[] = [];
  private snapshot: any = null;

  append(event: any) {
    this.events.push(event);
  }

  getEvents() {
    return this.events;
  }

  createSnapshot(state: any) {
    this.snapshot = { state, index: this.events.length };
  }

  restore() {
    return this.snapshot;
  }
}
