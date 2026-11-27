const alive = (pid) => {
  try {
    Deno.kill(pid, "SIGURG");
    return true;
  } catch {
    return false;
  }
};

export class Locks {
  constructor(paladin) {
    this.paladin = paladin;
  }

  mount(slug) {
    return this.paladin.scope.ledger.branch(`/locks/${slug}.lock`);
  }

  write(slug, record) {
    return this.paladin.write.json(this.mount(slug), record);
  }

  async read(slug) {
    const lock = await this.paladin.read.json(this.mount(slug), null);
    if (!lock) return null;
    const gone = (held) => Number.isInteger(held.pid) && !alive(held.pid);
    const exited = (held) =>
      gone(held) && held.status !== "EXITED" ? { ...held, status: "EXITED" } : held;
    if (!alive(lock.pid) || (lock.processes.length > 0 && lock.processes.every(gone))) {
      await this.remove(slug);
      return null;
    }
    return { ...lock, processes: lock.processes.map(exited) };
  }

  remove(slug) {
    return this.paladin.remove.file(this.mount(slug));
  }

  async list() {
    const home = this.paladin.scope.ledger.branch("locks").absolute;
    if (!(await Deno.stat(home).catch(() => null))) return [];
    const entries = await Array.fromAsync(Deno.readDir(home));
    const slugs = entries
      .filter((entry) => entry.name.endsWith(".lock"))
      .map((entry) => entry.name.slice(0, -".lock".length));
    const held = await Promise.all(slugs.map((slug) => this.read(slug)));
    return held.filter(Boolean);
  }
}
