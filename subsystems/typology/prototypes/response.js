import { ConnectionError } from "./errors/index.js";

export class Response {
  constructor(response = {}) {
    this.status = response.status ?? 0;
    this.headers = new Map(Object.entries(response.headers || {}));
    this.body = response.body ?? null;
    this.error = response.error ?? null;
  }

  get ok() {
    return this.status >= 200 && this.status < 300;
  }
  setError(error) {
    this.error =
      error instanceof ConnectionError
        ? error
        : ConnectionError.fromStatus(this.status, this);
  }

  get json() {
    return {
      status: this.status,
      ok: this.ok,
      headers: Object.fromEntries(this.headers),
      body: this.body,
      error: this.error,
    };
  }
  get isNetworkError() {
    return this.status === 0;
  }
  get isServerError() {
    return this.status >= 500;
  }
  get isClientError() {
    return this.status >= 400 && this.status < 500;
  }
  get isAuthError() {
    return this.status === 401 || this.status === 403;
  }
}
// export class Response {
//   constructor(response = {}) {
//     this.status = response.status ?? 0;
//     this.headers = new Map(Object.entries(response.headers || {}));
//     this.body = response.body || {};
//   }

//   get ok() {
//     return this.status >= 200 && this.status < 300;
//   }

//   get json() {
//     return {
//       status: this.status,
//       ok: this.ok,
//       headers: Object.fromEntries(this.headers),
//       body: this.body,
//     };
//   }
// }
// //
