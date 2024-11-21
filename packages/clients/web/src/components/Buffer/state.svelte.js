import { fromScope } from "$lib/blacklist.js";
import { env } from "$env/dynamic/public";

const QUEUE_THRESHOLD = parseInt(env["PUBLIC_QUEUE_THRESHOLD"]);

export default class BufferState {
  handlers = {};

  status = $state("IDLE");
  active = $state(null);
  queue = $state([]);

  constructor({ onCompleted, pull }) {
    this.handlers = { onCompleted, pull };
  }

  next() {
    if (this.active) this.handlers.onCompleted({ ...this.active });
    if (this.queue.length > 0) this.active = this.queue.shift();
    this.pull();
  }

  async pull() {
    if (this.queue.length >= QUEUE_THRESHOLD) return;
    this.status = "PULLING";

    const instructions = await this.handlers.pull({
      take: QUEUE_THRESHOLD,
      blacklist: this.blacklist(),
    });

    this.queue.push(...instructions);
    this.active = this.active || this.queue.shift();
    this.status = "IDLE";
  }

  blacklist() {
    // maybe doesnt belond here at all.
    // this would be prettier as a reducer.
    let blacklist = { units: [], tags: [] };

    [this.active, ...this.queue]
      .filter((x) => x?.scope)
      .forEach((item) => {
        blacklist = fromScope({ blacklist, scope: item.scope });
      });

    return blacklist;
  }

  reset() {
    this.active = null;
    this.queue = [];
    this.status = "IDLE";
  }
}
