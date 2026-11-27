/**
 * Drift-free stopwatch. Elapsed time is always computed from timestamps
 * (Date.now()), never by counting ticks, so it stays accurate when the tab
 * is backgrounded or the device sleeps.
 */
export class Stopwatch {
  constructor({ accumulatedMs = 0, startedAt = null } = {}) {
    this.accumulatedMs = accumulatedMs;
    this.startedAt = startedAt; // epoch ms while running, null while paused
  }

  get running() {
    return this.startedAt !== null;
  }

  elapsed(now = Date.now()) {
    return this.accumulatedMs + (this.running ? now - this.startedAt : 0);
  }

  start(now = Date.now()) {
    if (!this.running) this.startedAt = now;
  }

  pause(now = Date.now()) {
    if (this.running) {
      this.accumulatedMs += now - this.startedAt;
      this.startedAt = null;
    }
  }

  reset() {
    this.accumulatedMs = 0;
    this.startedAt = null;
  }

  toJSON() {
    return { accumulatedMs: this.accumulatedMs, startedAt: this.startedAt };
  }
}
