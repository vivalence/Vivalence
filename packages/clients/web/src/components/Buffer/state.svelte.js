import { env } from "$env/dynamic/public";

const QUEUE_THRESHOLD = parseInt(env["PUBLIC_QUEUE_THRESHOLD"]);

export default class BufferState {
  handlers = {};

  status = $state("IDLE");
  active = $state(null);
  queue = $state([]);

  constructor({ onNext, pull }) {
    this.handlers = { onNext, pull };
  }

  next() {
    this.status = "NEXT";
    let prev = { ...this.active };
    this.active = null;
    if (this.queue.length > 0) this.active = this.queue.shift();

    this.handlers.onNext({ prev, next: this.active });
    this.status = "IDLE";
    this.pull();
  }

  async pull() {
    if (this.queue.length >= QUEUE_THRESHOLD) return;
    this.status = "PULLING";
    const instructions = await this.handlers.pull({ take: QUEUE_THRESHOLD, buffer: this });
    this.queue.push(...instructions);
    if (!this.active) this.active = this.queue.shift();
    this.status = "IDLE";
  }

  reset() {
    this.active = null;
    this.queue = [];
    this.status = "IDLE";
  }
}
