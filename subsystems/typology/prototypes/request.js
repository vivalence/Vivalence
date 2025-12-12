import { Url } from "./url.js";

export class Request {
  constructor(request = {}) {
    this.url = request.url instanceof Url ? request.url : new Url(request.url);
    this.method = request.method || "POST";
    this.headers = request.headers || {};
    this.body = request.body;
    this.signal = request.signal;
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
