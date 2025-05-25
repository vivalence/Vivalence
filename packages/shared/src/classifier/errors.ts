export class UnknownFormError extends Error {
  constructor(form) {
    super("Invoked parse with unknown form:", form);
  }
}

export class InvalidOnError extends Error {
  constructor() {
    super("classifier.on must be called with form of signal or feature");
  }
}
