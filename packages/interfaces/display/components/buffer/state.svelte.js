export default class BufferState {
  handlers = {
    pull: null,
    hooks: [],
  };

  threshold = 0;
  status = $state("IDLE");
  active = $state(null);
  queue = $state([]);

  constructor(threshold, pull) {
    this.threshold = threshold;
    this.handlers.pull = pull;
  }

  next(promise) {
    this.status = "NEXT";
    let prev = { ...this.active }; // TODO: deepclone

    this.active = null;
    if (this.queue.length > 0) this.active = this.queue.shift();

    this.hooks(prev, this.active, promise);

    this.status = "IDLE";
    this.pull();
  }

  push(mode) {
    this.queue.push(mode);
    if (!this.active) this.active = this.queue.shift();
  }

  async pull() {
    if (this.status === "PULLING") return;
    if (this.queue.length >= this.threshold) return;

    this.status = "PULLING";
    try {
      const modes = await this.handlers.pull(this);
      this.queue.push(...modes);
      if (!this.active) this.active = this.queue.shift();
    } catch (error) {
      console.log("[BUFFER PULL ERROR]", error);
    }

    this.status = "IDLE";
  }

  reset() {
    this.active = null;
    this.queue = [];
    this.status = "IDLE";
  }

  onNext(fn) {
    this.handlers.hooks.push(fn);
  }

  hooks(prev, active, promise) {
    [...prev.hooks, ...this.handlers.hooks].map((f) =>
      f(prev, active, promise),
    );
  }
}
