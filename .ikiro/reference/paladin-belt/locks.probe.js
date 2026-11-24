import { Path } from "@vivalence/typology";
import { Paladin, FULL, lifecycle } from "@vivalence/paladin/typology";

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
    return this.paladin.state.json(this.mount(slug), record);
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
    return this.paladin.state.remove(this.mount(slug));
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

const root = await Deno.makeTempDir({ prefix: "locks-probe-" });
const paladin = lifecycle.paladin.belt(new Paladin(), FULL);
paladin.scopes([["ledger", () => true, () => new Path(root)]]);
const locks = new Locks(paladin);

console.log("empty list", await locks.list());
await locks.write("alive", { pid: Deno.pid, instance: "alive", processes: [] });
await locks.write("dead", { pid: 999999, instance: "dead", processes: [] });
console.log("read alive", await locks.read("alive"));
console.log("read dead", await locks.read("dead"));
const dead = await Deno.stat(locks.mount("dead").absolute).catch(() => null);
console.log("dead file after read", dead);
console.log("list", (await locks.list()).map((held) => held.instance));
await locks.remove("alive");
console.log("list after remove", await locks.list());
await Deno.remove(root, { recursive: true });
