import { atom } from "nanostores";

export class ThreadContext {
  constructor(quarters, lighthouse) {
    this.quarters = quarters;
    this.lighthouse = lighthouse;
    this.$current = atom(null);
    const nativeSet = this.$current.set.bind(this.$current);
    this.$current.set = (thread) => {
      const previous = this.$current.get();
      if (thread === previous) return;
      if (previous?.queue) previous.queue.deactivate();
      nativeSet(thread);
      if (thread?.queue) thread.queue.activate();
    };
    quarters.$active.subscribe(() => this.resolve());
    lighthouse.$daemons.subscribe(() => this.resolve());
  }

  async resolve() {
    for (const terminal of this.quarters.terminals.all()) {
      if (!terminal.daemon || !terminal.thread) continue;
      const threadId = terminal.thread?.id ?? terminal.thread;
      if (typeof threadId !== "string") continue;
      const daemonSlug = terminal.daemon?.slug ?? terminal.daemon;
      const daemon = this.lighthouse.daemons.get(daemonSlug);
      if (!daemon?.entities?.thread) continue;
      const thread =
        daemon.entities.thread.findOneLocal({ id: threadId }) ??
        (await daemon.entities.thread.findOne({ id: threadId }));
      if (thread) terminal.thread = thread;
    }

    const active = this.quarters.$terminal.get();
    this.$current.set(active?.thread?.id ? active.thread : null);
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
