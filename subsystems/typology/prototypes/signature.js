import { is, hash } from "@vivalence/shared";

export class Signature {
  // type?: string
  // signature: string | any
  // trace?: Signature
  // gauges: Signature[]

  //trace
  get hash() {
    return hash.array([this.index, this.type, this.signature]);
  }
  get ancestor() {
    // console.log('outdated')
    return this.trace;
  }
  constructor(signature = null, trace = null) {
    if (!this.gauges) this.gauges = [];
    if (this.Is(signature)) return signature;
    if (is.string(signature)) signature = this.parse(signature);
    if (is.array(signature)) {
      if (signature[0]) Object.assign(this, signature.shift());
      if (signature[0]) this.branch(signature);
    }
    if (this.is(signature)) Object.assign(this, signature);
    if (is.fn(signature)) return new this.prototype(signature(this), this);
    if (trace || signature?.trace) this.from(trace || signature.trace);
  }

  from(trace) {
    this.trace = trace;
    this.trace.gauges.push(this);
    if (is.fn(trace.signature) && !this.signature) {
      this.signature = trace.signature;
      this.filter = trace.signature;
    }
    return this;
  }

  branch(signature) {
    return new this.constructor(signature, this);
  }

  leaf(leaf) {
    this.branch(leaf);
    return this;
  }
  yeet(yeet) {
    let position = this;
    while (position.heir) position = position.heir;
    position.branch(yeet);
    return this;
  }
  pop() {
    if (this.trace) {
      this.trace.gauges = this.trace.gauges //
        .filter((i) => i.hash !== this.hash); // this.identity(i) ===
      this.trace = null;
    }

    return this;
  }

  get ghost() {
    return !this.signature && this.heir;
  }

  get heir() {
    return this.gauges[0];
  }

  get tilde() {
    let position = this;
    while (position.trace) position = position.trace;
    return position;
  }

  get fin() {
    let position = this.heir;
    while (position?.heir) position = position.heir;
    return position;
  }

  get depth() {
    // recast for flat.
    let depth = 0;
    let position = this;
    while (position.heir) {
      position = position.heir;
      depth++;
    }
    return depth;
  }

  get index() {
    // recast for flat.
    let depth = 0;
    let position = this;
    while (position.trace) {
      position = position.trace;
      depth++;
    }
    return depth;
  }

  Is(s) {
    return s instanceof this.constructor;
  }

  *[Symbol.iterator]() {
    let position = this;
    while (position) {
      yield position;
      position = position.heir;
    }
  }

  get array() {
    return Array.from(this);
  }
  flatMap(cb) {
    return this.array.flatMap(cb);
  }
}

// // Or if you want to iterate in reverse (from current to root):
// *reverse() {
//   let position = this;

//   while (position) {
//     yield position;
//     position = position.trace;
//   }
// }

// // Or if you want to iterate through all descendants:
// *descendants() {
//   for (const gauge of this.gauges) {
//     yield gauge;
//     yield* gauge.descendants();
//   }
// }
