// maybe use something like kv.js cache.
import { Parser, Feature, Context, Signal } from "./types.ts";

export class Classifier {
  private descendants: Map<string, Parser[]>;
  // private features: Map<string'parser.hash', Map<string'signal.hash', feature.serial>>;

  constructor() {
    this.descendants = new Map();
    this.features = new Map(); // cache map
  }

  cache(parser, signal, features) {
    // this.features.get[string of parser type].get[string of signal.hash] .set[JSON.stringify(features)]
    return features;
  }

  async find(parser, signal) {
    // return new Promse(sync(resolve )=>{
    // i want to work with locks here. the first invocation creates the key but no value.
    // if the cache.get(parser,signal) isnt present, we resolve(null).
    // if it is, and it has a value, we return the value
    // if its not { in that case we know another execution branch is working on that. we should then return a promise that resolves when the key is set. either trough some reactive paradigm or with events.
    //     we now need to find a clever way to await the cache function is invoked with our parser,signal pair.
    //     extremely optional optimization for the absolute fringes. but nice to include if its easy to pull off. maybe another map of cached promises and i invoke them with a hook after cache
    //     probably valuable since we have llms and other expensive operations in the loop.
    // }
    // const features = this.features.get[string of parser type].get[string of signal.hash]
    // return features.map(f => new Feature(f))
    // })
  }

  on(signal: Signal, parser: Functino): Classifier {
    this.descendants.get(signal.type).push(new Parser(parser));
    // handle first time signal.type
    return this;
  }

  async parse(signal: Signal, ctx: Context): Promise<Feature[]> {
    const FEATURES = [];

    for (const parsers of this.descendants.get(signal.type)) {
      // check if parser.hash for signal.hash is in cache. if it is, return cache. if its not, compute features and cache them.
      let features = await this.find(parser, signal);
      if (features) features.forEach((f) => FEATURES.push(f));
      else {
        // i need to enforce that for each parser, next is only called once.
        features = await parser(signal.value, ctx, this.next(ctx /* new ReleasemMchanism()*/));
        this.cache({ parser, signal, features }).forEach((f) => FEATURES.push(f));
      }
    }

    return FEATURES;
  }
  // next should probably be a function that returns a function.
  // the first function receives the ctx and release.
  // invoked on parser(..., this.next(ctx,release));
  // returns the second function, the release makes sure if its been called once before.

  next(ctx: Context, release: any) {
    return async (signals: Signal[]): Promise<Feature[]> => {
      //if i ever want to implement security in terms of depth, what i could do is to save ctx hashes (given guarantee of uniqueness) and count invocations or invocation depths...
      return await Promise.all(signals.map((signal) => this.parse(signal, ctx))); //.flat();
    };
  }
}

export default Classifier;
