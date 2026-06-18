import { atom } from "nanostores";

const ACTIVE_KEY = "viva.main.terminal";

function restore(terminals) {
  const id = localStorage.getItem(ACTIVE_KEY);
  if (id && terminals.has(id)) return terminals.findOne(id);
  return terminals.all()[0] ?? null;
}

function persist(terminal) {
  if (terminal?.id) localStorage.setItem(ACTIVE_KEY, terminal.id);
  else localStorage.removeItem(ACTIVE_KEY);
}

function activeThread(terminalStore) {
  const out = atom(null);
  let inner = null;
  terminalStore.subscribe((terminal) => {
    inner?.();
    inner = terminal?.$thread
      ? terminal.$thread.subscribe((thread) => out.set(thread?.id ? thread : null))
      : (out.set(null), null);
  });
  return out;
}

export class Main {
  constructor(terminals, lighthouse) {
    this.terminals = terminals;
    this.lighthouse = lighthouse;

    this.$terminal = atom(restore(terminals));
    this.$thread = activeThread(this.$terminal);

    this.$terminal.subscribe(persist);

    let live = null;
    this.$thread.subscribe((thread) => {
      if (thread === live) return;
      live?.queue?.deactivate();
      thread?.queue?.activate();
      live = thread;
    });

    lighthouse.$daemons.subscribe(() => this.hydrate());
  }

  get terminal() {
    return this.$terminal.get();
  }
  get thread() {
    return this.$thread.get();
  }
  get daemon() {
    return this.thread?.daemon ?? null;
  }
  get mode() {
    return this.thread?.mode ?? null;
  }

  activate(id) {
    const terminal = this.terminals.findOne(id);
    if (terminal) this.$terminal.set(terminal);
  }

  close(id) {
    this.terminals.remove(id);
    if (this.terminal?.id === id) {
      this.$terminal.set(this.terminals.all().at(-1) ?? null);
    }
  }

  set(thread) {
    const terminal = this.terminal;
    if (!terminal) return;
    this.terminals.update(terminal.id, {
      daemon: thread?.daemon ?? null,
      thread: thread ?? null,
    });
  }

  clear() {
    this.set(null);
  }

  async hydrate() {
    let mutated = false;
    for (const terminal of this.terminals.all()) {
      if (!terminal.daemon || !terminal.thread) continue;
      const threadId = terminal.thread?.id ?? terminal.thread;
      if (typeof threadId !== "string") continue;
      const daemonSlug = terminal.daemon?.slug ?? terminal.daemon;
      const daemon = this.lighthouse.daemons.findOneLocal({ slug: daemonSlug });
      if (!daemon?.entities?.thread) continue;
      const local = daemon.entities.thread.findOneLocal({ id: threadId });
      let thread;
      if (local) {
        thread = local.queue ? local : await daemon.entities.thread.merge(local);
      } else {
        thread = await daemon.entities.thread.findOne({ id: threadId });
      }
      if (terminal.daemon !== daemon) {
        terminal.daemon = daemon;
        mutated = true;
      }
      if (thread && terminal.thread !== thread) {
        terminal.thread = thread;
        mutated = true;
      }
    }
    if (mutated) this.terminals.refresh?.();
  }
}
