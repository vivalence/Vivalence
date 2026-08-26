export class Env {
  constructor(order = ["process"]) {
    this.order = order;
    this.strata = new Map(order.map((tag) => [tag, {}]));

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

  get(key, fallback = null) {
    for (const vars of this.strata.values()) {
      if (vars[key] !== undefined) return vars[key];
    }
    return fallback;
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
