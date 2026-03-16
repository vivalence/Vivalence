import { hash } from "@vivalence/typology";

// function hash(value) {const str = typeof value === "string" ? value : JSON.stringify(value); let h = 0; for (let i = 0; i < str.length; i++) {h = ((h << 5) - h + str.charCodeAt(i)) | 0;} return h.toString(36);}

class Feature {
  constructor(data = {}) {
    this.token = data.token || {};
    this.annotation = data.annotation || {};
    this.classifiable = null;
  }

  from(classifiable) {
    if (!this.classifiable) this.classifiable = classifiable;
    return this;
  }

  get cached() {
    return JSON.stringify({ token: this.token, annotation: this.annotation });
  }

  static fromCache(cache) {
    return new Feature(JSON.parse(cache));
  }
}

class Classifiable {
  constructor(type, value) {
    this.type = type;
    this.value = value;
    this.ancestor = null;
  }

  get hash() {
    return hash.array([this.type, this.value]);
  }

  from(ancestor) {
    if (!this.ancestor) this.ancestor = ancestor;
    return this;
  }
}

class Classifier {
  constructor() {
    this.hooks = [];
    this.classifiables = new Map();
    this.cache = new Map();
    this.pending = new Map();
  }

  get forms() {
    return Array.from(this.classifiables.keys());
  }

  on(type, fn) {
    if (type === Feature) {
      this.hooks.push(fn);
    } else {
      if (!this.classifiables.has(type)) this.classifiables.set(type, []);
      this.classifiables.get(type).push(fn);
    }
    return this;
  }

  async parse(classifiable, ctx) {
    const parsers = this.classifiables.get(classifiable.constructor);
    if (!parsers) throw new Error(`Unknown classifiable: ${classifiable.constructor.name}`);

    const features = [];
    for (const parser of parsers) {
      const result = await this._extract(classifiable, parser, ctx);
      features.push(...result);
    }
    return features.filter(Boolean);
  }

  async _extract(classifiable, parser, ctx) {
    const key = `${hash.string(parser.toString())}:${classifiable.hash}`;

    // Return cached
    const cached = this.cache.get(key);
    if (cached) return cached.map((c) => Feature.fromCache(c));

    // Wait if already processing
    if (this.pending.has(key)) {
      return new Promise((resolve, reject) => {
        this.pending.get(key).push({ resolve, reject });
      });
    }

    // Mark as processing
    this.pending.set(key, []);

    const forward = async (classifiables) => {
      const results = await Promise.all(
        classifiables.map((s) => this.parse(s.from(classifiable), ctx)),
      );
      return results.flat();
    };

    let features = await parser(classifiable.value, ctx, forward);
    features = [features]
      .flat()
      .filter(Boolean)
      .map((f) => (f instanceof Feature ? f : new Feature(f)))
      .map((f) => f.from(classifiable));

    // Cache and resolve pending
    this.cache.set(
      key,
      features.map((f) => f.cached),
    );
    for (const { resolve } of this.pending.get(key)) resolve(features);
    this.pending.delete(key);

    return features;
  }

  factory(ctx) {
    return new Proxy(this, {
      get: (_, name) => {
        const Form = this.forms.find((f) => f.name.toLowerCase() === name);
        if (!Form) return undefined;
        return async (value) => {
          let features = await this.parse(new Form(value), ctx);
          for (const hook of this.hooks) {
            features = await Promise.all(features.map((f) => hook(f, ctx)));
            features = features.flat().filter(Boolean);
          }
          return features;
        };
      },
    });
  }
}

export { Classifier, Classifiable, Feature };
