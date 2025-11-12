import { is, cast } from "@vivalence/typology";

import { array, hash } from "@vivalence/shared";

// signature = null; type = null; trace = null; gauges = null;
// signature: string | any type?: string trace?: Signature gauges: Signature[]
export class Signature {
  hasher() {
    return hash.array([this.index, this.type, this.nature]);
  }
  get hash() {
    return this.hasher();
  }
  get signature() {
    return this.nature;
  }

  constructor(nature = null, trace = null) {
    // this.nature = signature // future
    if (!this.gauges) this.gauges = []; // ?

    // -- identity
    if (nature instanceof this.constructor) return nature.from(trace);
    // if (this.ought?.(nature)) nature = this.is(nature);
    // -- slurp
    if (is.string(nature)) {
      this.nature = nature;
      if (this.parse) nature = this.parse(nature);
    }
    if (is.array(nature)) {
      // assert nature[0] is.string || this.is
      if (nature[0]) Object.assign(this, nature.shift());
      if (nature[0]) this.branch(nature);
    }
    if (this.is(nature)) Object.assign(this, nature); // wrong handler!
    // if (this.nature(signature)) Object.assign(this, signature);

    // default
    if (is.fn(nature)) return new this.prototype(nature(this), this);
    if (trace || nature?.trace) this.from(trace || nature.trace);
  }

  from(trace) {
    this.trace = trace;
    this.trace?.gauges.push(this);
    if (is.fn(trace?.nature) && !this.nature) {
      this.nature = trace.nature;
      this.filter = trace.nature;
    }
    return this;
  }

  branch(nature) {
    return new this.constructor(nature, this);
  }

  stick(stick) {
    this.branch(stick);
    return this;
  }

  yeet(yeet) {
    if (this.heir) this.finn.branch(yeet);
    else this.branch(yeet);
    // let position = this;
    // while (position.heir) position = position.heir;
    // position.branch(yeet);
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

  grab(gauge, drop = true) {
    const grab = this.gauges.find(({ hash }) => hash === gauge.hash);
    if (drop && grab) this.drop(grab);
    return grab;
  }

  // snatch
  // severe(brats) {return cast .array(this.ancestory()) .map((s) => this.grab(s)) .filter((f) => !!f);}

  *ancestory() {
    for (const gauge of this.gauges) {
      yield gauge;
      yield* gauge.ancestory(); // if is? avoid depth first!
    }
  }

  *heritage() {
    let position = this;
    while (position) {
      yield position;
      position = position.trace;
    }
  }

  get heir() {
    return this.gauges[0];
  }

  get ghost() {
    return !this.nature && this.heir;
  }

  get fin() {
    let position = this.heir;
    while (position?.heir) position = position.heir;
    return position;
  }

  *finn() {
    let position = this;
    while (position.heir) {
      yield position.heir;
      position = position.heir;
    }
  }

  get tilde() {
    let position = this;
    while (position.trace) position = position.trace;
    return position;
  }

  // last universal ancestor
  get lua() {
    let position;
    while (position?.gauges.length === 1) position = position.trace;
    return position;
  }
  // last universal common ancestor
  luca(common = null) {
    if (!common) return this.lua;
    return console.log("todo common luca");
  }

  get array() {
    const array = [];
    for (const trace of this.heritage()) array.unshift(trace);
    for (const trace of this.finn()) array.push(trace);
    return array;
    // get absolute() return new this.constructor([...array.reverse(this.heritage()), this, ...this.fin()]);
    // return [...array.reverse(this.heritage()), this, ...this.finn()];
  }

  get absolute() {
    return this.array.map((s) => s.nature);
  }

  get julie() {
    // return this.trace.array.indexOf(this)+1
  }

  get frotscher() {
    return new this.constructor(this.absolute);
  }

  //  rebuild.
  is(thing) {
    if (!this.ought) throw new Error("you can not derive an ought from an is.");
    return this.ought(thing);
  }

  [Symbol.toPrimitive](hint) {
    // this was a bad idea.
    console.log("toPrimitive");
    if (hint === "string") return `${this.nature}`;
    throw new Error("@typology/signature: unhandled toPrimitive hint:", hint);
  }

  [Symbol.for("nodejs.util.inspect.custom")]() {
    return `${this.constructor.name}:${this.nature}`;
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

  // /REWORK
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

  // /SUNSET
  // leaf(leaf) {console.trace("[SIGNATURE] legacy leaf call"); return this.stick(leaf);} get ancestor() {console.trace("[SIGNATURE] legacy ancestor call"); return this.trace;}

  // *absolute() {
  //   for (const step of [...this.heritage(), this, ...this.fin()]) {
  //     yield step;
  //   }
  // }
  // *[Symbol.iterator]() {
  //   // SUS
  //   console.log("maybe not use directly as iterator");
  //   let position = this;
  //   while (position) {
  //     yield position;
  //     position = position.heir;
  //   }
  // }
}

// ideas
// [Symbol.hasInstance](instance) {return Array.isArray(instance);}
//  console.log([] instanceof Array1);

// const testSymbols = {
//   signature: Symbol.for("test.nature"),
//   construction: Symbol.for("test.construction.gestalt"),
//   valences: Symbol.for("test.valences")
// };
// export class Path extends Signature {
//   get [testSymbols.nature]() {
//     return `path:${this.nature}:${this.hash}`;
//   }
//   [Symbol.toPrimitive](hint) {
//     if (hint === "string") return this[testSymbols.nature];
//     return super[Symbol.toPrimitive](hint);
//   }
// }
