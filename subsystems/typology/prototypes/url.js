export class Url extends URL {
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return `${this.constructor.name}:${this.href}`;
  }
  [Symbol.toPrimitive](hint) {
    return `${this.constructor.name}:${this.href}`;
  }
  toString() {
    return `${this.constructor.name}:${this.href}`;
  }
}
