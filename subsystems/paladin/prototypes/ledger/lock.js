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
    try {
      Deno.kill(lock.pid, "SIGURG");
      return lock;
    } catch {
      await this.remove();
      return null;
    }
  }
  remove() {
    return this.paladin.state.remove(this.path);
  }
}
