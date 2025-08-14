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
