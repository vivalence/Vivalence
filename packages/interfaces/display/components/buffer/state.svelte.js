export default class BufferState {
  handlers = {
    pull: null,
    onNext: [],
  };

  threshold = 0;
  status = $state("IDLE");
  active = $state(null);
  queue = $state([]);

  constructor(threshold, pull) {
    this.threshold = threshold;
    this.handlers.pull = pull;
  }

  next() {
    this.status = "NEXT";
    // TODO: deepclone
    let prev = { ...this.active };
    this.active = null;
    if (this.queue.length > 0) this.active = this.queue.shift();
    this.handlers.onNext.map((f) => f(prev, this.active));
    this.status = "IDLE";
    this.pull();
  }

  async pull() {
    if (this.queue.length >= this.threshold) return;
    this.status = "PULLING";

    this.queue.push(...(await this.handlers.pull(this)));
    if (!this.active) this.active = this.queue.shift();
    this.status = "IDLE";
  }

  reset() {
    this.active = null;
    this.queue = [];
    this.status = "IDLE";
  }
  onNext(fn) {
    this.handlers.onNext.push(fn);
  }
}
