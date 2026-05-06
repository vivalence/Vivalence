import { atom } from "nanostores";

export const StallStatusEnum = Object.freeze({
  UNINITIALIZED: "<uninitialized>",
  IDLE: "IDLE",
  PULLING: "PULLING",
  EXHAUSTED: "EXHAUSTED",
  ERROR: "ERROR",
  CLOSED: "CLOSED",
});

const TERMINAL_STATUSES = [
  StallStatusEnum.UNINITIALIZED,
  StallStatusEnum.CLOSED,
  StallStatusEnum.PULLING,
  StallStatusEnum.EXHAUSTED,
  StallStatusEnum.ERROR,
];

export class Stall {
  $source;
  $active;
  $error = atom(null);
  $status = atom(StallStatusEnum.UNINITIALIZED);

  threshold = 0;
  teardowns = [];
  handlers = { pull: null, hooks: [] };

  constructor($source, $active) {
    this.$source = $source;
    this.$active = $active;
  }

  withPull(pull, threshold = 0) {
    this.handlers.pull = pull;
    this.threshold = threshold;
    this.$status.set(StallStatusEnum.IDLE);
    return this;
  }

  activate() {
    if (this.teardowns.length) return this;
    this.$status.set(StallStatusEnum.IDLE);

    this.teardowns.push(
      this.$status.subscribe((status) => {
        if (status !== StallStatusEnum.IDLE) return;
        if (!this.$active.get() && this.$source.get().length) this.advance();
        if (this.$source.get().length < this.threshold) this.pull();
      }),
    );

    this.teardowns.push(
      this.$source.subscribe(() => {
        if (this.$status.get() !== StallStatusEnum.IDLE) return;
        if (!this.$active.get() && this.$source.get().length) this.advance();
      }),
    );

    return this;
  }

  deactivate() {
    for (const teardown of this.teardowns) teardown();
    this.teardowns = [];
  }

  advance() {
    const items = this.$source.get();
    if (items.length > 0) this.$active.set(items[0]);
  }

  next(promise) {
    const status = this.$status.get();
    if (status === StallStatusEnum.CLOSED) return;

    const prev = this.$active.get();
    this.$active.set(null);

    this.advance();
    this.runHooks(prev, this.$active.get(), promise);

    if (this.$source.get().length < this.threshold) this.pull();
  }

  async pull() {
    const status = this.$status.get();
    if (TERMINAL_STATUSES.includes(status)) return;
    if (this.$source.get().length > this.threshold) return;
    if (!this.handlers.pull) return;

    this.$status.set(StallStatusEnum.PULLING);

    try {
      const result = await this.handlers.pull(this);
      if (this.$status.get() === StallStatusEnum.CLOSED) return;
      const condition = result?.condition ?? (result?.buffers?.length ? "NOMINAL" : "EXHAUSTED");

      if (condition === "NOMINAL") this.$status.set(StallStatusEnum.IDLE);
      else if (condition === "EXHAUSTED") this.$status.set(StallStatusEnum.EXHAUSTED);
      else if (condition === "ERROR") {
        console.error("[stall] pull returned ERROR:", result.error);
        this.$status.set(StallStatusEnum.ERROR);
        this.$error.set(result.error);
      }
    } catch (error) {
      console.error("[stall] pull failed:", error);
      this.$status.set(StallStatusEnum.ERROR);
      this.$error.set(error);
    }
  }

  close() {
    this.$status.set(StallStatusEnum.CLOSED);
    this.handlers.pull = null;
    this.handlers.hooks = [];
  }

  reset() {
    this.handlers.pull = null;
    this.handlers.hooks = [];
    this.$active.set(null);
    this.$status.set(StallStatusEnum.IDLE);
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
      queue: this.$source.get().map((b) => b?.toJSON?.() ?? b?.id ?? b),
      error: this.$error.get()?.message ?? null,
      hasPull: !!this.handlers.pull,
      hooks: this.handlers.hooks.length,
    };
  }
}
