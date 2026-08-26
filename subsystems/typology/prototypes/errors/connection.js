export class ConnectionError extends Error {
  constructor(type, message, context = {}) {
    super(message);
    this.name = "ConnectionError";
    this.type = type;
    this.context = context;
    this.timestamp = Date.now();
    this.isRetryable = ["NETWORK", "TIMEOUT", "SERVER"].includes(type);
  }

  static network(message, context) {
    return new ConnectionError("NETWORK", message, context);
  }

  static timeout(message, context) {
    return new ConnectionError("TIMEOUT", message, context);
  }

  static server(status, context, detail = "") {
    return new ConnectionError("SERVER", `Server error: ${status}${detail}`, context);
  }

  static auth(message, context) {
    return new ConnectionError("AUTH", message, context);
  }

  static client(status, context, detail = "") {
    return new ConnectionError("CLIENT", `Client error: ${status}${detail}`, context);
  }

  static fromFetch(error, request) {
    if (error.name === "AbortError") {
      return ConnectionError.timeout("Request aborted", { request, error });
    }
    return ConnectionError.network("Network request failed", {
      request,
      error,
    });
  }

  static fromStatus(status, response) {
    const body = response?.body;
    // a handler may answer { error: { code, message } } or put them at the top — read both, or the
    // reason the server gave is dropped and the caller sees only a bare status.
    const held = body?.error ?? body;
    const detail = held?.message || held?.code || "";
    const suffix = detail ? ` — ${detail}` : "";
    if (status >= 500) return ConnectionError.server(status, { response }, suffix);
    if (status === 401 || status === 403)
      return ConnectionError.auth(`Unauthorized${suffix}`, { response });
    if (status >= 400) return ConnectionError.client(status, { response }, suffix);
    return null;
  }
}
