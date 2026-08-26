// ${VAR} only. bare $VAR stays literal — too easy to write inside a password.
const REFERENCE = /\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g;

export class Env {
  constructor(order = ["process"]) {
    this.order = order;
    this.strata = new Map(order.map((tag) => [tag, {}]));
    // source → every ambient read of it. a list: one file can be observed at several strata.
    this.ambient = new Map();

    return new Proxy(this, {
      get(target, prop) {
        if (prop in target) {
          return target[prop];
        }
        return target.get(prop, undefined);
      },
    });
  }

  stratum(tag) {
    const vars = this.strata.get(tag);
    if (!vars) {
      throw new Error(`[Env] unknown stratum '${tag}' — declared: ${this.order.join(" ")}`);
    }
    return vars;
  }

  get vars() {
    return [...this.strata.values()].reduceRight((folded, vars) => Object.assign(folded, vars), {});
  }

  assign(obj, tag = this.order[0]) {
    Object.assign(this.stratum(tag), obj.vars || obj);
    return this;
  }

  // ambient — provisional until the file's owner claims it.
  observe(obj, tag, source) {
    const bag = obj.vars ?? obj;
    if (source) this.ambient.set(source, [...(this.ambient.get(source) ?? []), { tag, keys: Object.keys(bag) }]);
    return this.assign(bag, tag);
  }

  // role — evicts every ambient claim on the same path.
  claim(obj, tag, source) {
    for (const held of (source && this.ambient.get(source)) || []) {
      if (held.tag === tag) continue;
      for (const key of held.keys) delete this.stratum(held.tag)[key];
    }
    if (source) this.ambient.delete(source);
    return this.assign(obj, tag);
  }

  // SUPERSEDED — @std/dotenv expands nothing, so every derived address was written out in full.
  // get(key, fallback = null) {
  //   for (const vars of this.strata.values()) {
  //     if (vars[key] !== undefined) return vars[key];
  //   }
  //   return fallback;
  // }
  get(key, fallback = null, seen = null) {
    for (const vars of this.strata.values()) {
      if (vars[key] !== undefined) return this.expand(vars[key], key, seen);
    }
    return fallback;
  }

  // lazy, so order of loading does not matter. one bag only. unresolved stays literal.
  expand(value, key, seen) {
    if (typeof value !== "string" || !value.includes("${")) return value;
    if (seen?.has(key)) {
      throw new Error(`[Env] cyclic \${} reference: ${[...seen, key].join(" → ")}`);
    }
    const held = new Set(seen ?? []).add(key);
    return value.replace(REFERENCE, (whole, name) => {
      const resolved = this.get(name, null, held);
      return resolved === null ? whole : resolved;
    });
  }

  set(key, value, tag = this.order[0]) {
    this.stratum(tag)[key] = value;
    return this;
  }

  has(key) {
    for (const vars of this.strata.values()) if (key in vars) return true;
    return false;
  }

  provenance(key) {
    for (const [tag, vars] of this.strata) if (key in vars) return tag;
    return null;
  }

  strati(key) {
    return [...this.strata]
      .filter(([, vars]) => key in vars)
      .map(([stratum, vars]) => ({ stratum, value: vars[key] }));
  }

  delete(key) {
    for (const vars of this.strata.values()) delete vars[key];
  }
}
