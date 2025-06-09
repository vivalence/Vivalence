import { fn, array } from "@vivalence/shared";
import type { Context } from "./types.ts";
import { Feature, Parser, ParserFunction, Signal, Form } from "./types.ts";
import { UnknownFormError, InvalidOnError } from "./errors.ts";

export class Classifier {
  private signals: Map<Form, Parser[]>;
  private features: Map<string, string>;
  private promises: Map<string, Array<{ resolve: Function; reject: Function }>>;
  private hooks: Parser[]; // Only apply on factory;

  constructor() {
    this.hooks = [];
    this.signals = new Map();
    this.features = new Map();
    this.promises = new Map();
  }
  get forms(): Form[] {
    return Array.from(this.signals.keys());
  }
  register(form: Form): Classifier {
    if (!this.signals.has(form)) {
      this.signals.set(form, []);
    }
    return this.signals.get(form);
  }
  on(type: Form | Feature, parser: ParserFunction) {
    if (type === Feature) this.hooks.push(parser);
    else if (type.prototype instanceof Form) {
      if (!(parser instanceof Parser)) parser = new Parser(parser);
      this.register(type).push(parser);
    } else throw new InvalidOnError();
    return this;
  }
  factory(ctx: Context) {
    return new Proxy(this, {
      get: (_: any, name: string) => {
        const Form = this.forms.find((g) => g.name.toLowerCase() === name);
        if (!Form) return undefined;
        return async (signal: any) => {
          let features = await this.parse(new Form(signal), ctx);
          const hooks = this.hooks.map(
            (hook) => (feature) => hook(feature, ctx),
          );
          features = await fn.reduceEach(hooks, features);
          features = array.ensureFlat(features).filter((feature) => !!feature);
          return features;
        };

        // if (!Form) throw new UnknownFormError(name);
      },
    });
  }
  private key(parser, signal) {
    return `${parser.hash}:${signal.hash}`;
  }
  private find(parser, signal) {
    const key = this.key(parser, signal);
    if (!this.features.has(key)) {
      this.features.set(key, null);
      return null;
    }
    let features = this.features.get(key);
    if (features === null) {
      return this.expect(parser, signal);
    }
    return features.map((f) => new Feature().fromCache(f));
  }
  private cache(parser, signal, features) {
    const key = this.key(parser, signal);
    if (!this.features.get(key)) {
      const cache = features.map((f) => f.cached);
      this.features.set(key, cache);
      this.deliver(parser, signal, features);
    }
    return features;
  }
  private expect(parser, signal) {
    const key = this.key(parser, signal);
    return new Promise((resolve, reject) => {
      if (!this.promises.has(key)) this.promises.set(key, []);
      this.promises.get(key).push({ resolve, reject });
    });
  }
  private deliver(parser, signal, features) {
    const key = this.key(parser, signal);
    if (this.promises.has(key)) {
      this.promises.get(key).forEach(({ resolve }) => resolve(features));
      this.promises.delete(key);
    }
  }
  async extract(signal: Signal, parser, ctx: Context): Promise<Feature[]> {
    let features = await this.find(parser, signal);
    if (!features) {
      features = await parser.parse(signal, ctx, this.forward(signal, ctx));
      features = array.ensureFlat(features).filter((feature) => !!feature);
      this.cache(parser, signal, features);
    }
    return features.map((feature) => feature.from(signal));
  }
  async parse(signal: Signal, ctx: Context): Promise<Feature[]> {
    if (!this.signals.has(signal.constructor))
      throw new UnknownFormError(signal.constructor);

    let features = [];
    for (const parser of this.signals.get(signal.constructor)) {
      features.push(await this.extract(signal, parser, ctx));
    }
    features = array.ensureFlat(features).filter((feature) => !!feature);
    return features;
  }
  forward(ancestor?: Signal, ctx: Context) {
    return fn.once(async (signals: Signal[]): Promise<Feature[]> => {
      const features = signals
        .map((signal) => signal.from(ancestor))
        .map((signal) => this.parse(signal, ctx));
      return (await Promise.all(features)).flat();
    });
  }
}
export default Classifier;
