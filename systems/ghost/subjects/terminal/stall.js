import { Vector, steer } from "@vivalence/typology";

export const phases = new Vector();

/* @beef
phases
  .branch({ nature: "/inert", valence: "the mode manages its own buffers; the stall touches nothing. Example: /inert" })
  .do(() => {});
*/

phases
  .branch({ nature: "/manual", valence: "an empty thread gets one blank buffer; the frame holds the thread's oldest buffer until it leaves. Example: /manual" })
  .use(async (stallCtx, next) => {
    if (stallCtx.terminal.stall.$buffers.get().length === 0)
      await stallCtx.terminal.client.runtime.entities.buffer.create({ mode: stallCtx.terminal.thread.mode.id, thread: stallCtx.terminal.thread.id, data: {} });
    await next();
  })
  .do((stallCtx) => {
    if (stallCtx.terminal.stall.$buffers.get().includes(stallCtx.terminal.stall.$buffer.get())) return;
    stallCtx.terminal.stall.$buffer.set(stallCtx.terminal.stall.$buffers.get()[0] ?? null);
  });

/* @beef
phases
  .branch({ nature: "/continuous", valence: "the thread's emitter keeps QUEUEING.depth buffers queued; the frame holds the oldest. Example: /continuous" })
  .use(async (stallCtx, next) => {
    if (!stallCtx.terminal.thread.traits.includes("AIMED"))
      throw new Error(`[stall] /continuous: thread #${stallCtx.terminal.thread.id} claims no AIMED — its traits: ${stallCtx.terminal.thread.traits.join(" · ") || "none"}`);
    await next();
  })
  .use(async (stallCtx, next) => {
    if (stallCtx.terminal.stall.$buffers.get().length < stallCtx.terminal.thread.trait.QUEUEING.depth) {
      const emission = await stallCtx.terminal.thread.mode.connection.call(stallCtx.terminal.thread.trait.AIMED.mount, { thread: stallCtx.terminal.thread.id, ...stallCtx.terminal.thread.trait.MASKED });
      for (const buffer of emission.output.buffer) await stallCtx.terminal.client.runtime.entities.buffer.merge(buffer);
    }
    await next();
  })
  .do((stallCtx) => {
    if (stallCtx.terminal.stall.$buffers.get().includes(stallCtx.terminal.stall.$buffer.get())) return;
    stallCtx.terminal.stall.$buffer.set(stallCtx.terminal.stall.$buffers.get()[0] ?? null);
  });
*/

export class Stall {
  refilling = Promise.resolve();

  constructor(terminal) {
    this.terminal = terminal;
  }

  get $buffers() {
    return this.terminal.thread.$buffers;
  }

  get $buffer() {
    return this.terminal.$buffer;
  }

  get $phase() {
    return this.terminal.thread.$phase;
  }

  refill() {
    this.refilling = this.refilling
      .then(() => steer.dispatch.execute(phases, { terminal: this.terminal }, `/${this.$phase.get()}`))
      .catch((error) => this.terminal.controller.stdout.fault(error));
    return this.refilling;
  }

  watch() {
    let watching = [];
    const seated = this.terminal.$thread.subscribe((thread) => {
      for (const off of watching) off();
      watching = thread === null ? [] : [this.$buffers.subscribe(() => this.refill()), this.$phase.subscribe(() => this.refill())];
    });
    return () => {
      seated();
      for (const off of watching) off();
    };
  }

  toJSON() {
    if (this.terminal.thread === null) return { thread: null };
    return {
      thread: this.terminal.thread.id,
      phase: this.$phase.get(),
      buffer: this.$buffer.get() === null ? null : this.$buffer.get().id,
      buffers: this.$buffers.get().map((buffer) => buffer.id),
    };
  }
}
