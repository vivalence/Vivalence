import { object, Path } from "@vivalence/typology";
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
  async held(slug) {
    const lock = await this.paladin.read.json(this.mount(slug), null);
    if (!lock) return null;
    const gone = (process) => Number.isInteger(process.pid) && !alive(process.pid);
    const exited = (process) =>
      gone(process) && process.status !== "EXITED" ? { ...process, status: "EXITED" } : process;
    if (!alive(lock.pid) || (lock.processes.length > 0 && lock.processes.every(gone))) {
      await this.paladin.state.remove(this.mount(slug));
      return null;
    }
    return { ...lock, processes: lock.processes.map(exited) };
  }
  async find(where = {}) {
    const home = this.paladin.scope.ledger.branch("locks").absolute;
    if (!(await Deno.stat(home).catch(() => null))) return [];
    const entries = await Array.fromAsync(Deno.readDir(home));
    const slugs = entries
      .filter((entry) => entry.name.endsWith(".lock"))
      .map((entry) => entry.name.slice(0, -".lock".length));
    const locks = await Promise.all(slugs.map((slug) => this.held(slug)));
    return locks.filter(Boolean).filter((lock) => object.match(lock, where));
  }
  async findOne(where = {}) {
    return (await this.find(where))[0] ?? null;
  }
  async upsert(data) {
    await this.paladin.state.json(this.mount(data.instance), data);
    return data;
  }
  async removeOne(where) {
    const lock = await this.findOne(where);
    if (lock) await this.paladin.state.remove(this.mount(lock.instance));
    return lock;
  }
}

const root = await Deno.makeTempDir({ prefix: "sets-probe-" });
const paladin = lifecycle.paladin.belt(new Paladin(), FULL);
paladin.scopes([["ledger", () => true, () => new Path(root)]]);
const locks = new Locks(paladin);

console.log("find, empty", await locks.find());
await locks.upsert({ pid: Deno.pid, instance: "alive", status: "ALIVE", processes: [] });
await locks.upsert({ pid: Deno.pid, instance: "other", status: "SPAWNED", processes: [] });
await locks.upsert({ pid: 999999, instance: "dead", status: "ALIVE", processes: [] });
console.log("findOne { instance }", await locks.findOne({ instance: "alive" }));
console.log("findOne dead", await locks.findOne({ instance: "dead" }));
const byStatus = await locks.find({ status: "SPAWNED" });
console.log("find { status }", byStatus.map((lock) => lock.instance));
console.log("find all", (await locks.find()).map((lock) => lock.instance).sort());
console.log("removeOne", (await locks.removeOne({ instance: "alive" })).instance);
console.log("find after", (await locks.find()).map((lock) => lock.instance));

const started = performance.now();
for (let turn = 0; turn < 200; turn++) await locks.findOne({ instance: "other" });
console.log("findOne ms each", ((performance.now() - started) / 200).toFixed(3));
await Deno.remove(root, { recursive: true });
