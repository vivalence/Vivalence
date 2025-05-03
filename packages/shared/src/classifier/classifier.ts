import { fn, array } from "@vivalence/shared";
import type { Context } from "./types.ts";
import { Feature, Parser, ParserFunction, Signal } from "./types.ts";

export class Classifier {
  private signals: Map<typeof Signal, Parser[]>;
  private features: Map<string, string>;
  private promises: Map<string, Array<{ resolve: Function; reject: Function }>>;

  constructor() {
    this.signals = new Map();
    this.features = new Map();
    this.promises = new Map();
  }
  get generators() {
    return Array.from(this.signals.keys());
  }
  register(generator: typeof Signal): Classifier {
    if (!this.signals.has(generator)) {
      this.signals.set(generator, []);
    }
    return this.signals.get(generator);
  }
  on(generator: typeof Signal, parser: ParserFunction) {
    this.register(generator).push(
      parser instanceof Parser ? parser : new Parser(parser),
    );
  }
  with(ctx: Context) {
    return new Proxy(this, {
      get: (_: any, generatorName: string) => {
        const generator = this.generators.find(
          (g) => g.name.toLowerCase() === generatorName,
        );
        return (signal: any) => this.parse(new generator(signal), ctx);
        // throw new Error(`No signal found for: ${generatorName}`);
      },
    });
  }
  private key(parser, signal) {
    return `${parser.hash}:${signal.hash}`;
  }
  private find(parser, signal) {
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
  private expect(parser, signal) {
    const k = this.key(parser, signal);
    return new Promise((resolve, reject) => {
      if (!this.promises.has(k)) this.promises.set(k, []);
      this.promises.get(k).push({ resolve, reject });
    });
  }
  private cache(parser, signal, features) {
    const k = this.key(parser, signal);
    if (!this.features.get(k)) {
      const cache = features.map((f) => f.cached);
      this.features.set(k, cache);
      this.deliver(parser, signal, features);
    }
    return features;
  }
  private deliver(parser, signal, features) {
    const k = this.key(parser, signal);
    if (this.promises.has(k)) {
      this.promises.get(k).forEach(({ resolve }) => resolve(features));
      this.promises.delete(k);
    }
  }
  private context(ctx: Context, signal: Signal) {
    ctx.cast = { feature: (f) => new Feature(f) };
    // for (const generator of this.generators) {
    //   for (const g of generator.generators) {
    //     if (signal instanceof g) {
    //       ctx.cast[g.name.toLowerCase()] = (s) => new generator(s);
    //     }
    //   }
    // }
    return ctx;
  }
  async parse(signal: Signal, ctx: Context): Promise<Feature[]> {
    if (!this.signals.has(signal.constructor))
      throw new Error("Invoked parse with unknown Signal:", signal.constructor);
    const FEATURES = [];
    for (const parser of this.signals.get(signal.constructor)) {
      let features = await this.find(parser, signal);
      if (!features) {
        features = array
          .ensureFlat(
            await parser.parse(
              signal,
              this.context(ctx, signal),
              this.next(ctx, signal),
            ),
          )
          .filter((feature) => !!feature);
        this.cache(parser, signal, features);
      }
      FEATURES.push(features.map((feature) => feature.from(signal)));
    }
    return FEATURES.flat();
  }
  next(ctx: Context, ancestor?: Signal) {
    return fn.once(async (signals: Signal[]): Promise<Feature[]> => {
      return (
        await Promise.all(
          signals.map((signal) => this.parse(signal.from(ancestor), ctx)),
        )
      ).flat();
    });
  }
}
export default Classifier;
