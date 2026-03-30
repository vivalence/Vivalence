export class Long extends Error {
  code = "LONG";
  constructor() {
    super("Max steps");
  }
}

export class Short extends Error {
  code = "SHORT";
  constructor() {
    super("No more signal");
  }
}

export class NotFound extends Error {
  code = "NOT_FOUND";
  constructor(signal) {
    super("Not found", signal);
    this.signal = signal;
  }
}

export class ValidationError extends Error {
  code = "VALIDATION";
  constructor(errors, signal) {
    super(`Validation failed: ${errors.map((e) => e.message).join(", ")}`);
    this.errors = errors;
    this.signal = signal;
  }
}
