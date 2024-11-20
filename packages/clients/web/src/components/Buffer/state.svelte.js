import { fromScope } from "$lib/blacklist.js";
import { env } from "$env/dynamic/public";

const QUEUE_THRESHOLD = parseInt(env["PUBLIC_QUEUE_THRESHOLD"]);

export default class BufferState {
  runtime = {};
  instructions = {};
  status = $state("IDLE");
  active = $state(null);
  queue = $state([]);

  constructor({ runtime, instructions }) {
    this.runtime = runtime;
    this.instructions = instructions;
    this.pull();
  }

  next() {
    if (this.active) this.instructions.completed({ ...this.active });
    if (this.queue.length > 0) this.active = this.queue.shift();
    this.pull();
  }

  async pull() {
    if (this.queue.length >= QUEUE_THRESHOLD) return;
    this.status = "PULLING";

    const instructions = await this.instructions.pull({
      take: QUEUE_THRESHOLD,
      blacklist: this.blacklist(),
    });

    this.queue.push(...instructions);
    this.active = this.active || this.queue.shift();
    this.status = "IDLE";
  }

  blacklist() {
    let blacklist = { units: [], tags: [] };

    [this.active, ...this.queue]
      .filter((x) => x)
      .filter((x) => x.type === "GAME")
      .forEach((item) => {
        blacklist = fromScope({ blacklist, scope: item.scope });
      });
    // .reduce((scopes, item) => {if (item.type !== "SIGNAL") scopes.push(item.scope); return scopes;}, [])
    // .map((scope) => {blacklist = fromScope({ blacklist, scope });});

    return blacklist;
  }

  reset() {
    this.active = null;
    this.queue = [];
    this.status = "IDLE";
  }
}
