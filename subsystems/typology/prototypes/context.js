import { Request } from "./request.js";
import { Response } from "./response.js";

export class Context {
  constructor(context = {}) {
    Object.assign(this, context);
    this.request = this.request instanceof Request ? this.request : new Request(this.request ?? {});
    this.response = this.response ?? new Response();
    this.params = this.params ?? {};
    this.state = this.state ?? {};
  }

  get input() { return this.request.body; }
  set input(v) { this.request.body = v; }

  get output() { return this.response.body; }
  set output(v) { this.response.body = v; }
}
