import { is } from "@vivalence/typology";
import { array, hash } from "@vivalence/shared";

// signature = null; type = null; trace = null; gauges = null;
// signature: string | any type?: string trace?: Signature gauges: Signature[]
export class Signature {
  hasher() {
    return hash.array([this.index, this.type, this.signature]);
  }
  get hash() {
    return this.hasher();
  }
  constructor(signature = null, trace = null) {
    if (!this.gauges) this.gauges = []; // ?
    if (this.Is(signature)) return signature.from(trace);
    if (is.string(signature)) {
      this.signature = signature;
      if (this.parse) signature = this.parse(signature);
    }
    if (is.array(signature)) {
      if (signature[0]) Object.assign(this, signature.shift());
      if (signature[0]) this.branch(signature);
    }
    if (this.is(signature)) Object.assign(this, signature); // wrong handler!
    // if (this.signature(signature)) Object.assign(this, signature);
    if (is.fn(signature)) return new this.prototype(signature(this), this);
    if (trace || signature?.trace) this.from(trace || signature.trace);
  }

  from(trace) {
    this.trace = trace;
    this.trace?.gauges.push(this);
    if (is.fn(trace?.signature) && !this.signature) {
      this.signature = trace.signature;
      this.filter = trace.signature;
    }
    return this;
  }

  branch(signature) {
    return new this.constructor(signature, this);
  }

  stick(stick) {
    this.branch(stick);
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
      this.trace.drop(this);
      this.trace = null;
    }
    return this;
  }
  drop(gauge) {
    this.gauges = this.gauges.filter(({ hash }) => hash !== gauge.hash);
    return this;
  }

  get heir() {
    return this.gauges[0];
  }

  get tilde() {
    let position = this;
    while (position.trace) position = position.trace;
    return position;
  }

  get ghost() {
    return !this.signature && this.heir;
  }

  get array() {
    return [...array.reverse(this.heritage()), this, ...this.fin()];
    // get absolute() return new this.constructor([...array.reverse(this.heritage()), this, ...this.fin()]);
  }
  flatMap(cb) {
    return this.array.flatMap(cb);
  }

  *[Symbol.iterator]() {
    let position = this;
    while (position) {
      yield position;
      position = position.heir;
    }
  }
  *ancestory() {
    for (const gauge of this.gauges) {
      yield gauge;
      yield* gauge.ancestory();
    }
  }
  *heritage() {
    let position = this;
    while (position.trace) {
      yield position.trace;
      position = position.trace;
    }
  }
  // get fin() {let position = this.heir; while (position?.heir) position = position.heir; return position;}
  *fin() {
    let position = this;
    while (position.heir) {
      yield position.heir;
      position = position.heir;
    }
  }
  get finn() {
    let position = this.heir;
    while (position?.heir) position = position.heir;
    return position;
  }

  Is(s) {
    return s instanceof this.constructor;
  }
  is(thing) {
    if (!this.ought) throw new Error("you can not derive an ought from an is.");
    return this.ought(thing);
  }

  // /SUNSET
  // leaf(leaf) {console.trace("[SIGNATURE] legacy leaf call"); return this.stick(leaf);} get ancestor() {console.trace("[SIGNATURE] legacy ancestor call"); return this.trace;}

  // *absolute() {
  //   for (const step of [...this.heritage(), this, ...this.fin()]) {
  //     yield step;
  //   }
  // }

  [Symbol.toPrimitive](hint) {
    return `${this.signature}`;
  }

  // /REWORK
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
  // /SUS

  [Symbol.for("nodejs.util.inspect.custom")]() {
    return `${this.constructor.name}:${this.absolute}`;
  }
}

// ideas
// [Symbol.hasInstance](instance) {return Array.isArray(instance);}
//  console.log([] instanceof Array1);

// const testSymbols = {
//   signature: Symbol.for("test.signature"),
//   construction: Symbol.for("test.construction.gestalt"),
//   valences: Symbol.for("test.valences")
// };
// export class Path extends Signature {
//   get [testSymbols.signature]() {
//     return `path:${this.signature}:${this.hash}`;
//   }
//   [Symbol.toPrimitive](hint) {
//     if (hint === "string") return this[testSymbols.signature];
//     return super[Symbol.toPrimitive](hint);
//   }
// }
