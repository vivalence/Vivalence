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
      if (previous?.queue) previous.queue.deactivate(); // i dont like this!
      nativeSet(thread);
      if (thread?.queue) thread.queue.activate(); // i dont like this!
    };
    quarters.$active.subscribe(() => this.resolve());
    lighthouse.$daemons.subscribe(() => this.resolve());
  }

  get current() { return this.$current.get(); }

  async resolve() {
    for (const terminal of this.quarters.terminals.all()) {
      if (!terminal.daemon || !terminal.thread) continue;
      const threadId = terminal.thread?.id ?? terminal.thread; // @beef this should be eliminated by now!
      if (typeof threadId !== "string") continue;
      const daemonSlug = terminal.daemon?.slug ?? terminal.daemon; // again!
      const daemon = this.lighthouse.daemons.get(daemonSlug);
      if (!daemon?.entities?.thread) continue; // WHAT?
      const thread =
        daemon.entities.thread.findOneLocal({ id: threadId }) ??
        (await daemon.entities.thread.findOne({ id: threadId }));
      // weirdest!!!function.
      if (thread) terminal.thread = thread;
    }

    const active = this.quarters.$terminal.get();
    // what??!!
    this.$current.set(active?.thread?.id ? active.thread : null);
    // what??!!
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
