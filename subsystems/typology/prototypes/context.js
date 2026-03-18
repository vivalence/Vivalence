import { Request } from "./request.js";
import { Response } from "./response.js";

export class Context {
  constructor(request) {
    this.request = request instanceof Request ? request : new Request(request);
    this.response = new Response();
    this.state = {};
    this.params = {};
  }

  get input() { return this.request.body; }
  set input(v) { this.request.body = v; }

  get output() { return this.response.body; }
  set output(v) { this.response.body = v; }
}
