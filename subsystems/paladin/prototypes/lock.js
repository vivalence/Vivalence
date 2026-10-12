const alive = (pid) => {
  try {
    Deno.kill(pid, "SIGURG");
    return true;
  } catch {
    return false;
  }
};

export class Lock {
  constructor(paladin, path) {
    this.paladin = paladin;
    this.path = path;
  }
  write(record) {
    return this.paladin.state.json(this.path, record);
  }
  async read() {
    const lock = await this.paladin.read.json(this.path, null);
    if (!lock) return null;
    const gone = (held) => Number.isInteger(held.pid) && !alive(held.pid);
    const processes = lock.processes.map((held) => (gone(held) && held.status !== "EXITED" ? { ...held, status: "EXITED" } : held));
    if (!alive(lock.pid) || (lock.processes.length > 0 && lock.processes.every(gone))) {
      await this.remove();
      return null;
    }
    return { ...lock, processes };
  }
  remove() {
    return this.paladin.state.remove(this.path);
  }
}
