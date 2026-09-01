import { Wafer } from "@vivalence/typology";
import { Process } from "./process.js";

export class Die extends Wafer {
  get manifest() {
    return { type: "instance", slug: this.instance };
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

  claim(code) {
    if (!this.lock) return Promise.resolve();
    return this.lock.write({
      pid: Deno.pid,
      token: this.token,
      instance: this.instance,
      status: code,
      processes: this.good.processes.map((process) => ({ process: process.slug, pid: process.child.pid })),
      started: this.started,
    });
  }

  async release() {
    if (!this.lock) return;
    const held = await this.lock.read();
    if (held?.token === this.token) await this.lock.remove();
  }

  async resolve() {
    const held = await this.lock?.read();
    if (held) {
      throw new Error(`${this.instance} already running (supervisor ${held.pid}) — viva instance/stop`);
    }
    this.token = crypto.randomUUID();
    this.started = new Date().toISOString();
    for (const process of this.good.processes) await process.resolve();
    await this.claim("BOOTING");
    this.status.set({ code: "SPAWNED", pid: Deno.pid });
  }

  async integrate() {
    try {
      await Promise.all(this.good.processes.map((process) => process.integrate()));
    } catch (error) {
      await this.disintegrate();
      throw error;
    }
    await this.claim("ALIVE");
    this.status.set("alive");
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
    this.status.set("stopping");
    await Promise.all(this.good.processes.map((process) => process.disintegrate()));
    await this.release();
    this.status.set("stopped");
    this.abort.abort();
  }
}
