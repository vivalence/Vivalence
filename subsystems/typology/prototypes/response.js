export class Response {
  constructor(response = {}) {
    this.status = response.status ?? 0;
    this.headers = new Map(Object.entries(response.headers || {}));
    this.body = response.body || {};
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
