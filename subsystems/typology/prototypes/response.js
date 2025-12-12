export class Response {
  constructor(init = {}) {
    this.status = init.status ?? 0;
    this.headers = new Map(Object.entries(init.headers || {}));
    this.body = init.body || {};
  }

  get ok() {
    return this.status >= 200 && this.status < 300;
  }

  get json() {
    return {
      status: this.status,
      ok: this.ok,
      headers: Object.fromEntries(this.headers),
      body: this.body,
    };
  }
}
