import { fn, array } from "@vivalence/shared";
import { Feature, Parser, Signal } from "./types.js";
import { UnknownFormError, InvalidOnError } from "./errors.js";

export class Classifier {
  constructor() {
    this.hooks = [];
    this.signals = new Map();
    this.features = new Map();
    this.promises = new Map();
  }

  get forms() {
    return Array.from(this.signals.keys());
  }

  register(form) {
    if (!this.signals.has(form)) {
      this.signals.set(form, []);
    }
    return this.signals.get(form);
  }

  on(type, parser) {
    if (type === Feature) {
      this.hooks.push(parser);
    } else if (type.prototype instanceof Signal || type === Signal) {
      if (!(parser instanceof Parser)) parser = new Parser(parser);
      this.register(type).push(parser);
    } else {
      throw new InvalidOnError();
    }
    return this;
  }

  async spawn(signal, ctx) {
    let features = await this.parse(signal, ctx);
    const hooks = this.hooks.map((hook) => (feature) => hook(feature, ctx));
    features = await fn.reduceEach(hooks, features);
    features = array.ensureFlat(features).filter(Boolean);
    return features;
  }

  key(parser, signal) {
    return `${parser.hash}:${signal.hash}`;
  }

  find(parser, signal) {
    const key = this.key(parser, signal);
    if (!this.features.has(key)) {
      this.features.set(key, null);
      return null;
    }
    const cached = this.features.get(key);
    if (cached === null) {
      return this.expect(parser, signal);
    }
    return cached.map((c) => new Feature().fromCache(c));
  }

  cache(parser, signal, features) {
    const key = this.key(parser, signal);
    if (!this.features.get(key)) {
      const cached = features.map((f) => f.cached);
      this.features.set(key, cached);
      this.deliver(parser, signal, features);
    }
    return features;
  }

  expect(parser, signal) {
    const key = this.key(parser, signal);
    return new Promise((resolve, reject) => {
      if (!this.promises.has(key)) this.promises.set(key, []);
      this.promises.get(key).push({ resolve, reject });
    });
  }

  deliver(parser, signal, features) {
    const key = this.key(parser, signal);
    if (this.promises.has(key)) {
      this.promises.get(key).forEach(({ resolve }) => resolve(features));
      this.promises.delete(key);
    }
  }

  async extract(signal, parser, ctx) {
    let features = await this.find(parser, signal);
    if (!features) {
      features = await parser.parse(signal, ctx, this.forward(signal, ctx));
      features = array.ensureFlat(features).filter(Boolean);
      this.cache(parser, signal, features);
    }
    return features.map((feature) => feature.from(signal));
  }

  async parse(signal, ctx) {
    if (!this.signals.has(signal.constructor)) {
      throw new UnknownFormError(signal.constructor);
    }

    let features = [];
    for (const parser of this.signals.get(signal.constructor)) {
      features.push(await this.extract(signal, parser, ctx));
    }
    return array.ensureFlat(features).filter(Boolean);
  }

  forward(ancestor, ctx) {
    return fn.once(async (signals) => {
      const features = signals
        .map((signal) => signal.from(ancestor))
        .map((signal) => this.parse(signal, ctx));
      return (await Promise.all(features)).flat();
    });
  }
}

export default Classifier;
