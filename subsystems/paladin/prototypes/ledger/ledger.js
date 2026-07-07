import { fn } from "@vivalence/typology";
import { Lock } from "./lock.js";
import { Log } from "./log.js";
import { Instances } from "./instances.js";
import { Registry } from "./registry.js";
import { Process } from "./process.js";

export class Ledger {
  constructor(paladin) {
    this.paladin = paladin;
    this.attached = new Set();
    this.armed = false;
    this.mount = fn.once(this.mount.bind(this));
  }

  async mount() {
    this.instances = new Instances(
      this.paladin,
      this.paladin.scope.ledger.branch("instances.json"),
    );
    this.registry = new Registry(
      this.paladin,
      this.paladin.scope.ledger.branch("registry.json"),
    );
    this.paladin.publish();

    return this;
  }

  lock(instance, process) {
    return new Lock(this.paladin, this.paladin.scope.ledger.branch(`/locks/${instance}_${process}.lock`));
  }

  log(instance) {
    return new Log(this.paladin, instance);
  }

  async locks(instance) {
    const dir = this.paladin.scope.ledger.branch(`/locks`);
    const prefix = `${instance}_`;
    try {
      const out = [];
      for await (const entry of Deno.readDir(dir.absolute)) {
        if (!entry.name.startsWith(prefix) || !entry.name.endsWith(".lock")) continue;
        const process = entry.name.slice(prefix.length, -".lock".length);
        out.push({ instance, process, ...(await this.lock(instance, process).read()) });
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

  async kill(instance, process) {
    const lock = await this.lock(instance, process).read();
    if (!lock) return null;
    try {
      Deno.kill(lock.pid, "SIGTERM");
    } catch {
      /* gone */
    }
    await this.lock(instance, process).remove();
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
