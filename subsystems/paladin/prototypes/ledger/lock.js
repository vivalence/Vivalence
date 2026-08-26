export class Lock {
  constructor(paladin, path) {
    this.paladin = paladin;
    this.path = path;
  }
  write(record) {
    return this.paladin.state.json(this.path, record);
  }
  read() {
    return this.paladin.read.json(this.path, null);
  }
  remove() {
    return this.paladin.state.remove(this.path);
  }
  async alive() {
    const lock = await this.read();
    if (!lock) return false;
    try {
      Deno.kill(lock.pid, "SIGURG");
      return true;
    } catch {
      return false;
    }
  }
}
