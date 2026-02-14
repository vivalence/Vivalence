export class ProductionError extends Error {
  constructor(code, message, cause = {}) {
    super(message);
    this.code = code;
    this.cause = cause;
  }

  static request = (cause) =>
    new ProductionError(
      "REQUEST",
      "production request validation failed",
      cause,
    );

  static result = (cause) =>
    new ProductionError("RESULT", "production result validation failed", cause);
}
