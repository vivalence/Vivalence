export class Failure extends Error {
  constructor(code, record) {
    super([record.data?.message, record.data?.reason, record.data?.signal].find((part) => typeof part === "string" && part.length) ?? record.verb);
    this.code = code;
    this.record = record;
  }

  toJSON() {
    return { code: this.code, message: this.message, record: this.record };
  }
}
