import { Url } from "./url.js";

export class Request {
  constructor(request = {}) {
    this.url = request.url instanceof Url ? request.url : new Url(request.url);
    this.method = request.method || "POST";
    this.headers = new Map(Object.entries(request.headers || {}));
    this.body = request.body;
    this.query = request.query;
    this.path = request.path;

    this.options = {
      timeout: request.timeout ?? 30000,
      retries: request.retries ?? 0,
      credentials: request.credentials ?? "include",
      ...request.options,
    };

    this._controller = null;
    this._attempt = 0;
  }

  get signal() {
    if (!this._controller) {
      this._controller = new AbortController();
    }
    return this._controller.signal;
  }

  abort() {
    this._controller?.abort();
  }

  clone() {
    return new Request({
      url: this.url,
      method: this.method,
      headers: Object.fromEntries(this.headers),
      body: this.body,
      query: this.query,
      path: this.path,
      options: { ...this.options },
    });
  }

  get json() {
    return {
      url: this.url.absolute,
      method: this.method,
      headers: Object.fromEntries(this.headers),
      body: this.body,
      options: this.options,
    };
  }
}
// import { Url } from "./url.js";

// export class Request {
//   constructor(request = {}) {
//     this.url = request.url instanceof Url ? request.url : new Url(request.url);
//     this.method = request.method || "POST";
//     this.headers = new Map(Object.entries(request.headers || {}));
//     this.body = request.body;
//     this.query = request.query;
//     this.path = request.path;
//   }

//   get json() {
//     return {
//       url: this.url.absolute,
//       method: this.method,
//       headers: this.headers,
//       body: this.body,
//     };
//   }
// }
