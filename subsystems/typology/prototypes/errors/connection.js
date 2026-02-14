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

  static server(status, context) {
    return new ConnectionError("SERVER", `Server error: ${status}`, context);
  }

  static auth(message, context) {
    return new ConnectionError("AUTH", message, context);
  }

  static client(status, context) {
    return new ConnectionError("CLIENT", `Client error: ${status}`, context);
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
    if (status >= 500) return ConnectionError.server(status, { response });
    if (status === 401 || status === 403)
      return ConnectionError.auth("Unauthorized", { response });
    if (status >= 400) return ConnectionError.client(status, { response });
    return null;
  }
}
