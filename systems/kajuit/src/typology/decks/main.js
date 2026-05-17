import { atom, computed } from "nanostores";

const ACTIVE_KEY = "viva.main.terminal";

function restoreActive(terminals) {
  try {
    const stored = localStorage.getItem(ACTIVE_KEY);
    if (stored && terminals.has(stored)) return stored;
  } catch {}
  const all = terminals.all();
  return all.length ? all[0].id : null;
}

function persistActive(id) {
  try {
    if (id) localStorage.setItem(ACTIVE_KEY, id);
    else localStorage.removeItem(ACTIVE_KEY);
  } catch {}
}

export class Main {
  constructor(quarters, lighthouse) {
    this.quarters = quarters;
    this.lighthouse = lighthouse;

    this.$active = atom(restoreActive(quarters.terminals));
    this.$terminal = computed(this.$active, (id) =>
      id ? quarters.terminals.findOne({ id }) : null,
    );
    this.$current = atom(null);

    const nativeSet = this.$current.set.bind(this.$current);
    this.$current.set = (thread) => {
      const previous = this.$current.get();
      if (thread === previous) return;
      if (previous?.queue) previous.queue.deactivate();
      nativeSet(thread);
      if (thread?.queue) thread.queue.activate();
    };

    this.$active.subscribe(() => this.resolve());
    lighthouse.$daemons.subscribe(() => this.resolve());
  }

  get active() { return this.$active.get(); }
  get terminal() { return this.$terminal.get(); }
  get current() { return this.$current.get(); }
  get daemon() { return this.current?.daemon ?? null; }
  get mode() { return this.current?.mode ?? null; }

  async spawn(slug = null) {
    const terminal = await this.quarters.terminals.create({ slug });
    this.$active.set(terminal.id);
    persistActive(terminal.id);
    return terminal;
  }

  activate(id) {
    if (this.quarters.terminals.has(id)) {
      this.$active.set(id);
      persistActive(id);
    }
  }

  close(id) {
    this.quarters.terminals.remove(id);
    if (this.$active.get() === id) {
      const remaining = this.quarters.terminals.all();
      this.$active.set(remaining.length ? remaining.at(-1).id : null);
      persistActive(this.$active.get());
    }
  }

  async resolve() {
    let mutated = false;
    for (const terminal of this.quarters.terminals.all()) {
      if (!terminal.daemon || !terminal.thread) continue;
      const threadId = terminal.thread?.id ?? terminal.thread;
      if (typeof threadId !== "string") continue;
      const daemonSlug = terminal.daemon?.slug ?? terminal.daemon;
      const daemon = this.lighthouse.daemons.get(daemonSlug);
      if (!daemon?.entities?.thread) continue;
      const local = daemon.entities.thread.findOneLocal({ id: threadId });
      let thread;
      if (local) {
        thread = local.queue ? local : await daemon.entities.thread.merge(local);
      } else {
        thread = await daemon.entities.thread.findOne({ id: threadId });
      }
      if (thread && terminal.thread !== thread) {
        terminal.thread = thread;
        mutated = true;
      }
    }

    if (mutated) this.quarters.terminals.refresh?.();

    const active = this.$terminal.get();
    const activeThread = active?.thread?.id ? active.thread : null;
    this.$current.set(activeThread);
  }

  set(thread) {
    const terminal = this.$terminal.get();
    if (terminal) {
      this.quarters.terminals.update(terminal.id, {
        daemon: thread?.daemon?.slug ?? null,
        thread: thread ?? null,
      });
    }
    this.$current.set(thread);
  }

  clear() {
    const terminal = this.$terminal.get();
    if (terminal) {
      this.quarters.terminals.update(terminal.id, {
        daemon: null,
        thread: null,
      });
    }
    this.$current.set(null);
  }
}
