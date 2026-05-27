import { Pipe, fn } from "@vivalence/typology";
import { Lock } from "./lock.js";
// import { Log } from "./log.js";
import { Instances } from "./instances.js";
import { Process } from "./process.js";

export class System {
  constructor(paladin) {
    this.paladin = paladin;
    this.attached = new Set();
    // this.logs = new Pipe();
    this.armed = false;
    this.mount = fn.once(this.mount.bind(this));
  }

  async mount() {
    this.instances = new Instances(
      this.paladin,
      this.paladin.scope.system.branch("instances.json"),
    );
    this.paladin.publish();

    return this;
  }

  lock(type, slug) {
    return new Lock(this.paladin, this.paladin.scope.system.branch(`/locks/${type}_${slug}.lock`));
  }

  log(type, slug) {
    console.log("log(type, slug) LEGACY");
    //
  }

  async locks(type) {
    const dir = this.paladin.scope.system.branch(`/locks`);
    const prefix = `${type}_`;
    try {
      const out = [];
      for await (const entry of Deno.readDir(dir.absolute)) {
        if (!entry.name.startsWith(prefix) || !entry.name.endsWith(".lock")) continue;
        const slug = entry.name.slice(prefix.length, -".lock".length);
        out.push({ type, slug, ...(await this.lock(type, slug).read()) });
      }
      return out;
    } catch {
      return [];
    }
  }

  async spawn(spec) {
    const process = await new Process(this, spec).spawn();
    if (spec.attachment !== "detached") {
      this.arm();
      this.attached.add(process);
      process.status.then(() => this.attached.delete(process));
    }
    return process;
  }

  async boot(specs) {
    return await Promise.all(specs.map((spec) => this.spawn(spec)));
  }

  async kill(type, slug) {
    const lock = await this.lock(type, slug).read();
    if (!lock) return null;
    try {
      Deno.kill(lock.pid, "SIGTERM");
    } catch {
      /* gone */
    }
    await this.lock(type, slug).remove();
    return lock.pid;
  }

  arm() {
    if (this.armed) return;
    this.armed = true;
    for (const signal of ["SIGINT", "SIGTERM", "SIGQUIT"]) {
      Deno.addSignalListener(signal, () => this.teardown(signal));
    }
  }

  async teardown(signal) {
    await Promise.all([...this.attached].map((process) => process.kill()));
    Deno.exit(signal === "SIGINT" ? 130 : 0);
  }
}
