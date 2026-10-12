import { ShellSignal } from "./shellsignal.js";

export class ShellContext {
  constructor(context = {}) {
    Object.assign(this, context);
    this.signal =
      this.signal instanceof ShellSignal ? this.signal : new ShellSignal(this.signal ?? []);
    this.effect = this.effect ?? null;
  }
}
