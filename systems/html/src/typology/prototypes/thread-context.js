import { atom } from "nanostores";

export class ThreadContext {
  constructor(quarters, lighthouse) {
    this.quarters = quarters;
    this.lighthouse = lighthouse;
    this.$current = atom(null);
    quarters.$active.subscribe(() => this.resolve());
    lighthouse.$daemons.subscribe(() => this.resolve());
  }

  async resolve() {
    const terminal = this.quarters.$terminal.get();
    if (!terminal?.daemon || !terminal?.thread) {
      this.$current.set(null);
      return;
    }
    const daemon = this.lighthouse.daemons.get(terminal.daemon);
    if (!daemon?.entities?.thread) return;
    const thread =
      daemon.entities.thread.findOneLocal({ id: terminal.thread }) ??
      (await daemon.entities.thread.findOne({ id: terminal.thread }));
    this.$current.set(thread ?? null);
  }

  set(thread) {
    const terminal = this.quarters.$terminal.get();
    if (terminal) {
      this.quarters.terminals.update(terminal.id, {
        daemon: thread?.daemon?.slug ?? null,
        thread: thread?.id ?? null,
      });
    }
    this.$current.set(thread);
  }

  clear() {
    const terminal = this.quarters.$terminal.get();
    if (terminal) {
      this.quarters.terminals.update(terminal.id, {
        daemon: null,
        thread: null,
      });
    }
    this.$current.set(null);
  }
}
