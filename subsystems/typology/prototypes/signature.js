import { is, cast } from "@vivalence/typology";
import { array, hash } from "@vivalence/shared";

export class Signature {
  // nature = null; trace = null; gauges = [];
  static coercions = [];

  // [Symbol.for("nodejs.util.inspect.custom")]() {return `${this.constructor.name}:${this.absolute} [${this.nature}]`;}

  constructor(signature = null, trace = null) {
    if (!is.array(this.gauges)) this.gauges = [];

    signature = this.coerce(signature);

    if (is.fn(signature)) signature = signature(this.constructor);
    if (signature instanceof this.constructor) return signature.from(trace);
    if (signature instanceof Signature) this.nature = signature.nature;

    if (is.string(signature)) this.nature = signature;
    if (is.signature(signature)) Object.assign(this, signature);
    if (is.array(signature)) {
      // recursion if coerce returns array
      let root = signature.shift();
      root = new this.constructor(root).from(trace);
      if (!is.empty(signature)) root.branch(signature);
      return root;
    }

    if (trace) this.from(trace);
  }

  coerce(signature) {
    for (const [test, transform] of this.constructor.coercions) {
      // if (test(signature)) return transform(signature);
      if (test.call(this, signature)) return transform.call(this, signature);
      // recursion error if coerce returns array.
    }
    return signature;
  }

  from(trace, anon = false) {
    this.trace = trace;
    if (!anon) this.trace?.gauges.push(this);
    // if (is.fn(trace?.nature) && !this.nature) {this.nature = trace.nature; this.filter = trace.nature;}
    return this;
  }

  get absolute() {
    return this.array.map((s) => s.nature);
  }

  get json() {
    const json = { nature: this.nature, absolute: this.absolute };
    if (this.trace?.json) json.trace = this.trace.json;
    return json;
  }

  clone() {
    return new this.constructor(this); // recursive? maybe implement as new this.constructor().withJson(this.json)
  }

  branch(signature) {
    return new this.constructor(signature, this);
  }

  hasher() {
    return hash.array([this.nature]);
  }

  get hash() {
    return this.hasher();
  }

  //
  get array() {
    const array = [];
    for (const trace of this.heritage()) array.unshift(trace);
    for (const trace of this.finn()) array.push(trace);
    return array;

    // const result = [];
    // for (const node of this.heritage()) result.unshift(node);
    // return result;
  }

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

  *descendants() {
    for (const gauge of this.gauges) {
      yield gauge;
      yield* gauge.descendants();
    }
  }

  *finn() {
    let position = this;
    while (position.heir) {
      yield position.heir;
      position = position.heir;
    }
  }

  get heir() {
    return this.gauges[0];
  }

  get fin() {
    let position = this;
    while (position.heir) position = position.heir;
    return position === this ? null : position;
  }

  get tilde() {
    let position = this;
    while (position.trace) position = position.trace;
    return position;
  }

  get depth() {
    let maxDepth = 0;
    for (const gauge of this.gauges) {
      // ...??? lol.
      maxDepth = Math.max(maxDepth, 1 + gauge.depth);
    }
    return maxDepth;
  }

  get length() {
    return this.array.length;
    // return this.tilde.depth;
  }

  get index() {
    let count = 0;
    let position = this.trace;
    while (position) {
      count++;
      position = position.trace;
    }
    return count;
  }

  stick(signature) {
    this.branch(signature);
    return this;
  }

  yeet(signature) {
    this.fin?.branch(signature) ?? this.branch(signature);
    return this;
  }

  pop() {
    if (this.trace) {
      this.trace.drop(this);
      this.trace = null;
      delete this.trace;
    }
    return this;
  }

  drop(gauge) {
    this.gauges = this.gauges.filter(({ hash }) => hash !== gauge.hash);
    return this;
  }
  // shift(){//}

  grab(gauge, drop = true) {
    const found = this.gauges.find(({ hash }) => hash === gauge.hash);
    if (drop && found) this.drop(found);
    return found;
  }
  //   // snatch // severe(brats) {return cast .array(this.ancestory()) .map((s) => this.grab(s)) .filter((f) => !!f);}
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

  get julie() {
    // return this.trace.array.indexOf(this)+1
  }

  get frotscher() {
    return new this.constructor(this.absolute);
  }
  get ghost() {
    return !this.nature && this.heir;
  }
}
// import { is, cast } from "@vivalence/typology";
// import { array, hash } from "@vivalence/shared";

// // signature = null; type = null; trace = null; gauges = null;
// // signature: string | any type?: string trace?: Signature gauges: Signature[]
// export class Signature {
//   hasher() {
//     return hash.array([this.index, this.nature]);
//   }
//   get hash() {
//     return this.hasher();
//   }
//   get signature() {
//     // legacy?
//     return this.nature;
//   }

//   // gauges = []; //why not here?
//   constructor(nature = null, trace = null) {
//     if (!this.gauges) this.gauges = []; //?

//     if (this.framling(nature)) return nature.from(trace); //? || this);
//     if (this.raman(nature)) nature = this.parse(nature);

//     if (is.string(nature)) {
//       // if (this.parse) nature = this.parse(nature); // ?legacy
//       this.nature = nature;
//     } else if (is.array(nature)) {
//       // TODO assert nature[0]
//       if (nature[0]) Object.assign(this, nature.shift());
//       if (nature[0]) this.branch(nature);
//     }

//     if (is.fn(nature)) return new this.prototype(nature(this), this);
//     if (trace || nature?.trace) this.from(trace || nature.trace);
//   }

//   from(trace) {
//     this.trace = trace;
//     this.trace?.gauges.push(this);
//     if (is.fn(trace?.nature) && !this.nature) {
//       this.nature = trace.nature;
//       this.filter = trace.nature;
//     }
//     return this;
//   }

//   framling(nature) {
//     return nature instanceof this.constructor;
//   }

//   raman(thing) {
//     if (!this.ought) throw new Error("you can not derive an ought from an is.");
//     if (!this.parse) throw new Error("cant make friends if you dont want to.");
//     return this.ought(thing);
//   }

//   get array() {
//     const array = [];
//     for (const trace of this.heritage()) array.unshift(trace);
//     for (const trace of this.finn()) array.push(trace);
//     return array;
//     // get absolute() return new this.constructor([...array.reverse(this.heritage()), this, ...this.fin()]); return [...array.reverse(this.heritage()), this, ...this.finn()];
//   }

//   get absolute() {
//     return this.array.map((s) => s.nature);
//   }

//   branch(nature) {
//     return new this.constructor(nature, this);
//   }

//   stick(stick) {
//     this.branch(stick);
//     return this;
//   }

//   yeet(yeet) {
//     if (this.heir) this.finn.branch(yeet);
//     else this.branch(yeet);
//     return this;
//     // let position = this; while (position.heir) position = position.heir; position.branch(yeet);
//   }

//   pop() {
//     if (this.trace) {
//       this.trace.drop(this);
//       this.trace = null;
//     }
//     return this;
//   }

//   drop(gauge) {
//     this.gauges = this.gauges.filter(({ hash }) => hash !== gauge.hash);
//     return this;
//   }

//   grab(gauge, drop = true) {
//     const grab = this.gauges.find(({ hash }) => hash === gauge.hash);
//     if (drop && grab) this.drop(grab);
//     return grab;
//   }

//   // snatch // severe(brats) {return cast .array(this.ancestory()) .map((s) => this.grab(s)) .filter((f) => !!f);}

//   *ancestory() {
//     for (const gauge of this.gauges) {
//       yield gauge;
//       yield* gauge.ancestory(); // if is? avoid depth first!
//     }
//   }

//   *heritage() {
//     let position = this;
//     while (position) {
//       yield position;
//       position = position.trace;
//     }
//   }

//   get heir() {
//     return this.gauges[0];
//   }

//   get ghost() {
//     return !this.nature && this.heir;
//   }

//   get fin() {
//     let position = this.heir;
//     while (position?.heir) position = position.heir;
//     return position;
//   }

//   *finn() {
//     let position = this;
//     while (position.heir) {
//       yield position.heir;
//       position = position.heir;
//     }
//   }

//   get tilde() {
//     let position = this;
//     while (position.trace) position = position.trace;
//     return position;
//   }

//   // last universal ancestor
//   get lua() {
//     let position;
//     while (position?.gauges.length === 1) position = position.trace;
//     return position;
//   }
//   // last universal common ancestor
//   luca(common = null) {
//     if (!common) return this.lua;
//     return console.log("todo common luca");
//   }

//   get julie() {
//     // return this.trace.array.indexOf(this)+1
//   }

//   get frotscher() {
//     return new this.constructor(this.absolute);
//   }

//   // [Symbol.toPrimitive](hint) {
//   //   // this was a bad idea.
//   //   console.log("toPrimitive");
//   //   if (hint === "string") return `${this.nature}`;
//   //   throw new Error("@typology/signature: unhandled toPrimitive hint:", hint);
//   // }
//   get json() {
//     const json = { nature: this.nature, absolute: this.absolute };
//     if (this.trace?.json) json.trace = this.trace.json;
//     return json;
//   }

//   [Symbol.for("nodejs.util.inspect.custom")]() {
//     return `${this.constructor.name}:${this.nature}`;
//   }

//   // /REWORK
//   get depth() {
//     // recast for flat.
//     let depth = 0;
//     let position = this;
//     while (position.heir) {
//       position = position.heir;
//       depth++;
//     }
//     return depth;
//   }

//   // /REWORK
//   get index() {
//     // recast for flat.
//     let depth = 0;
//     let position = this;
//     while (position.trace) {
//       position = position.trace;
//       depth++;
//     }
//     return depth;
//   }

//   // /SUNSET
//   // leaf(leaf) {console.trace("[SIGNATURE] legacy leaf call"); return this.stick(leaf);} get ancestor() {console.trace("[SIGNATURE] legacy ancestor call"); return this.trace;}

//   // *absolute() {
//   //   for (const step of [...this.heritage(), this, ...this.fin()]) {
//   //     yield step;
//   //   }
//   // }
//   // *[Symbol.iterator]() {
//   //   // SUS
//   //   console.log("maybe not use directly as iterator");
//   //   let position = this;
//   //   while (position) {
//   //     yield position;
//   //     position = position.heir;
//   //   }
//   // }
// }

// // ideas
// // [Symbol.hasInstance](instance) {return Array.isArray(instance);}
// //  console.log([] instanceof Array1);

// // const testSymbols = {
// //   signature: Symbol.for("test.nature"),
// //   construction: Symbol.for("test.construction.gestalt"),
// //   valences: Symbol.for("test.valences")
// // };
// // export class Path extends Signature {
// //   get [testSymbols.nature]() {
// //     return `path:${this.nature}:${this.hash}`;
// //   }
// //   [Symbol.toPrimitive](hint) {
// //     if (hint === "string") return this[testSymbols.nature];
// //     return super[Symbol.toPrimitive](hint);
// //   }
// // }
