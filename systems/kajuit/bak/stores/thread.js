import { atom } from "nanostores";

export class Thread {
  constructor(quarters, lighthouse) {
    this.quarters = quarters;
    this.lighthouse = lighthouse;
    this.$current = atom(null);
    quarters.$active.subscribe(() => this.$current.set(this.resolve()));
    lighthouse.$daemons.subscribe(() => this.$current.set(this.resolve()));
  }

  resolve() {
    const terminal = this.quarters.$terminal.get();
    if (!terminal?.daemon || !terminal?.thread) return null;
    const daemon = this.lighthouse.daemons.get(terminal.daemon);
    if (!daemon?.entities?.thread) return null;
    const thread = daemon.entities.thread.findOneLocal({ id: terminal.thread });
    if (thread) daemon.entities.thread.resolve?.(thread);
    return thread;
  }

  set(thread) {
    const terminal = this.quarters.$terminal.get();
    if (terminal) {
      terminal.daemon = thread?.daemon?.slug ?? null;
      terminal.thread = thread?.id ?? null;
    }
    this.$current.set(thread);
  }

  clear() {
    const terminal = this.quarters.$terminal.get();
    if (terminal) {
      terminal.daemon = null;
      terminal.thread = null;
    }
    this.$current.set(null);
  }
}
