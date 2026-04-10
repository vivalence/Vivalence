import { atom } from "nanostores";

export class Stall {
  $queue;
  $active;
  $error = atom(null);
  $status = atom("<uninitialized>");

  threshold = 0;
  handlers = { pull: null, hooks: [] };

  constructor($queue, $active) {
    this.$queue = $queue;
    this.$active = $active;
  }

  withPull(pull, threshold = 0) {
    this.handlers.pull = pull;
    this.threshold = threshold;
    this.$status.set("IDLE");
    return this;
  }

  next(promise) {
    const status = this.$status.get();
    if (status === "CLOSED") return;

    const prev = this.$active.get();
    this.$active.set(null);
    const queue = this.$queue.get();

    if (queue.length > 0) {
      const [first, ...rest] = queue;
      this.$queue.set(rest);
      this.$active.set(first);
    }

    this.runHooks(prev, this.$active.get(), promise);

    if (status === "IDLE") this.pull();
  }

  async pull() {
    const status = this.$status.get();
    if (["CLOSED", "PULLING", "EXHAUSTED", "ERROR"].includes(status)) return;
    if (this.$queue.get().length > this.threshold) return;
    if (!this.handlers.pull) return;

    this.$status.set("PULLING");

    try {
      const result = await this.handlers.pull(this);
      const condition = result?.condition ?? (result?.buffers?.length ? "NOMINAL" : "EXHAUSTED");

      if (condition === "NOMINAL") this.$status.set("IDLE");
      else if (condition === "EXHAUSTED") this.$status.set("EXHAUSTED");
      else if (condition === "ERROR") {
        this.$status.set("ERROR");
        this.$error.set(result.error);
      }
    } catch (error) {
      this.$status.set("ERROR");
      this.$error.set(error);
    }
  }

  reset() {
    this.handlers.pull = null;
    this.handlers.hooks = [];
    this.$active.set(null);
    this.$queue.set([]);
    this.$status.set("IDLE");
  }

  onNext(fn) {
    this.handlers.hooks.push(fn);
  }

  runHooks(prev, active, promise) {
    this.handlers.hooks.forEach((f) => f(prev, active, promise));
  }

  toJSON() {
    const active = this.$active.get();
    return {
      status: this.$status.get(),
      active: active?.toJSON?.() ?? active?.id ?? null,
      queue: this.$queue.get().map((b) => b?.toJSON?.() ?? b?.id ?? b),
      error: this.$error.get()?.message ?? null,
      hasPull: !!this.handlers.pull,
      hooks: this.handlers.hooks.length,
    };
  }
}
