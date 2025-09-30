export class BaseError extends Error {
  constructor(message = "", code = null) {
    super(message);
    if (code) this.code = code;
    if (!this.code) throw new Error("ErrorCode required");
    this.timestamp = new Date().toISOString();
    this.traits = [];
    this.cause = {};
  }
  from(path) {
    this.cause.emitter = path;
  }
}
