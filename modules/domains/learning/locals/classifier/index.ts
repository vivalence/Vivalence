import { fn } from "@vivalence/shared";
import { Context, Feature, Parser, ParserFunction, Signal } from "./types.ts";

export class Classifier {
  private signals: Map<typeof Signal, Parser[]>;
  private features: Map<string, string>;
  private promises: Map<string, Array<{ resolve: Function; reject: Function }>>;
  constructor() {
    this.signals = new Map();
    this.features = new Map();
    this.promises = new Map();
  }
  on(constructor: typeof Signal, parser: Parser | ParserFunction): Classifier {
    if (!this.signals.has(constructor)) {
      this.signals.set(constructor, []);
    }
    this.signals.get(constructor).push(parser instanceof Parser ? parser : new Parser(parser));
    return this;
  }
  key(parser, signal) {
    return `${parser.hash}:${signal.hash}`;
  }
  find(parser, signal) {
    const k = this.key(parser, signal);
    if (!this.features.has(k)) {
      this.features.set(k, null);
      return null;
    }
    let features = this.features.get(k);
    if (features === null) {
      return this.expect(parser, signal);
    }
    return features.map((f) => new Feature().fromCache(f));
  }
  expect(parser, signal) {
    const k = this.key(parser, signal);
    return new Promise((resolve, reject) => {
      if (!this.promises.has(k)) this.promises.set(k, []);
      this.promises.get(k).push({ resolve, reject });
    });
  }
  deliver(parser, signal, features) {
    const k = this.key(parser, signal);
    if (this.promises.has(k)) {
      this.promises.get(k).forEach(({ resolve }) => resolve(features));
      this.promises.delete(k);
    }
  }
  async parse(signal: Signal, ctx: Context): Promise<Feature[]> {
    if (!this.signals.has(signal.constructor))
      throw new Error("Invoked parse with unknown Signal:", signal.constructor);

    const FEATURES = [];
    for (const parser of this.signals.get(signal.constructor)) {
      let features = await this.find(parser, signal);
      if (!features) {
        features = (await parser.parse(signal, ctx, this.next(ctx, signal))) //
          .filter((feature) => !!feature);
        this.cache(parser, signal, features);
      }
      FEATURES.push(features.map((feature) => feature.from(signal)));
    }
    return FEATURES.flat();
  }
  cache(parser, signal, features) {
    const k = this.key(parser, signal);
    if (!this.features.get(k)) {
      const cache = features.map((f) => f.cached);
      this.features.set(k, cache);
      this.deliver(parser, signal, features);
    }
    return features;
  }
  next(ctx: Context, ancestor?: Signal) {
    return fn.once(async (signals: Signal[]): Promise<Feature[]> => {
      return await Promise.all(signals.map((signal) => this.parse(signal.from(ancestor), ctx)));
    });
  }
}
export default Classifier;
