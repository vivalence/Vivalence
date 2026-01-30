import { Url } from "./url.js";

export class Request {
  constructor(request = {}) {
    this.url = request.url instanceof Url ? request.url : new Url(request.url);
    this.method = request.method || "POST";
    this.headers = new Map(Object.entries(request.headers || {}));
    this.body = request.body;
    this.query = request.query;
    this.path = request.path;
    this._signal = request.signal; // ought not be
  }

  get signal() {
    console.trace("REQUEST.signal used. search and destroy!");
    return this._signal;
  }
  get json() {
    return {
      url: this.url.absolute,
      method: this.method,
      headers: this.headers,
      body: this.body,
    };
  }
}
