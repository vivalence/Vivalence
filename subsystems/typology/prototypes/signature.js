import { array, hash, is, cast } from "@vivalence/typology";

export class Signature {
  // nature = null; trace = null; gauges = [];
  static coercions = [];
  // [Symbol.for("nodejs.util.inspect.custom")]() {return `${this.constructor.name}:${this.absolute} [${this.nature}]`;}

  constructor(signature = null, trace = null) {
    if (!is.array(this.gauges)) this.gauges = [];
    signature = this.coerce(signature);

    if (is.fn(signature)) signature = this.coerce(signature(this.constructor));
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

  toJSON() {
    return this.json;
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

  barf() {
    return new this.constructor(this.nature);
  }

  rebase(signature) {
    return new this.constructor(this.absolute, new this.constructor(signature));
  }

  // graft(signature) {return new this.constructor(this.heritage, signature);}

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

  get ghost() {
    return !this.nature && this.heir;
  }
}
