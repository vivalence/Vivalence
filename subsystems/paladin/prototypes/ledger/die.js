import { fn, Wafer } from "@vivalence/typology";
import { Process } from "./process.js";

const rows = (processes) => processes.map((held) => `${held.process}=${held.pid} ${held.status}`).join(", ");

export class Die extends Wafer {
  writing = Promise.resolve();
  vigil = () => {};

  get manifest() {
    return { type: "instance", slug: this.instance };
  }

  get json() {
    return {
      pid: Deno.pid,
      token: this.token,
      instance: this.instance,
      status: this.status.reflection.code,
      processes: this.good.processes.map((process) => process.json),
      started: this.started,
    };
  }

  async populate() {
    this.lock = this.instance ? this.ledger.lock(this.instance) : null;
    this.good = {
      processes: this.specs.map((spec) =>
        new Process({
          ...spec,
          identity: { ...spec.identity, instance: this.instance },
          ledger: this.ledger,
          attachment: this.attachment,
        })
      ),
    };
    for (const process of this.good.processes) await process.populate();
    this.status.set("populated");
  }

  claim() {
    if (!this.lock) return Promise.resolve();
    return (this.writing = this.writing.then(() => this.lock.write(this.json)));
  }

  async release() {
    if (!this.lock) return;
    this.vigil();
    await this.writing;
    const held = await this.lock.read();
    if (held?.token === this.token) await this.lock.remove();
  }

  async resolve() {
    const held = await this.lock?.read();
    if (held) {
      throw new Error(`${this.instance} already running (supervisor ${held.pid}: ${rows(held.processes)}) — viva instance/stop`);
    }
    this.token = crypto.randomUUID();
    this.started = new Date().toISOString();
    const offs = this.good.processes.map((process) => process.status.$transient.listen(() => this.claim()));
    this.vigil = fn.once(() => offs.forEach((off) => off()));
    for (const process of this.good.processes) await process.resolve();
    this.status.set({ code: "SPAWNED", pid: Deno.pid });
    await this.claim();
  }

  async integrate() {
    try {
      await Promise.all(this.good.processes.map((process) => process.integrate()));
    } catch (error) {
      await this.disintegrate();
      throw error;
    }
    this.status.set("alive");
    await this.claim();
  }

  async perpetuate() {
    for (const signal of ["SIGINT", "SIGTERM", "SIGQUIT"]) {
      Deno.addSignalListener(signal, () => this.disintegrate(signal));
    }
    const exits = await Promise.all(this.good.processes.map((process) => process.perpetuate()));
    await this.release();
    if (!this.status.is(["STOPPING", "STOPPED"])) this.status.set({ code: "EXITED", exits });
    return { exits, signal: this.signal ?? null };
  }

  async disintegrate(signal = null) {
    if (this.status.is(["STOPPING", "STOPPED", "EXITED"])) return;
    this.signal = signal;
    this.vigil();
    this.status.set("stopping");
    await Promise.all(this.good.processes.map((process) => process.disintegrate()));
    await this.release();
    this.status.set("stopped");
    this.abort.abort();
  }
}
