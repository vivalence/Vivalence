export class Env {
  constructor() {
    this.vars = {};

    return new Proxy(this, {
      get(target, prop) {
        if (prop in target) {
          return target[prop];
        }
        return target.vars[prop];
      },
    });
  }

  assign(obj) {
    Object.assign(this.vars, obj);
    return this;
  }

  get(key, fallback = null, persist = false) {
    const value = this.vars[key];
    if (value !== undefined) return value;

    if (typeof fallback === "string" && persist) {
      return this.set(key, fallback);
    }

    return fallback;
  }

  set(key, value) {
    this.vars[key] = value;
    return this;
  }

  has(key) {
    return key in this.vars;
  }

  delete(key) {
    delete this.vars[key];
    // Deno.env.delete(key);
  }

  // with(env) {this.vars = { ...env, ...this.vars };}

  _coerce(value) {
    if (typeof value === "string") {
      if (value === "true") return true;
      else if (value === "false") return false;
      else if (!isNaN(value) && value !== "") return Number(value);
      // if (value.startsWith("http")) env[key] = new URL(value);
      // if (value.startsWith("file:")) env[key] = new URL(value);
    }
  }
}
