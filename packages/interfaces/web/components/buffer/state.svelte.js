export default class BufferState {
  handlers = {
    pull: null,
    hooks: [],
  };

  threshold = 0;
  status = $state("STOP");
  active = $state(null);
  queue = $state([]);

  constructor(threshold) {
    this.threshold = threshold;
  }

  withPull(pull) {
    this.handlers.pull = pull;
  }

  next(promise) {
    if (["STOP", "NEXT"].includes(this.status)) return;
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
    if (["STOP", "PULLING"].includes(this.status)) return;
    if (this.queue.length >= this.threshold) return;
    this.status = "PULLING";

    try {
      if (!this.handlers.pull) throw new Error("Puller fehlt");
      const modes = await this.handlers.pull(this);
      this.queue.push(...modes);
      if (!this.active) this.active = this.queue.shift();
      this.status = "IDLE";
      // return this;
    } catch (error) {
      this.error = error;
      this.status = "STOP";
      console.log("[BUFFER PULL ERROR]", this);
    }
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
