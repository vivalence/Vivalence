import { Step, Signal, Pattern, Middleware, Context, Effect } from "../types.ts";
import { compose } from "./lib.ts";

// type Parsers : {signal,pattern}

export default class Trajectory {
  descendants: Map<Pattern, Trajectory>;
  effects: Map<Pattern, Effect>;
  middlewares: Middleware[];

  constructor(parsers: any) {
    this.parsers = parsers;
    this.effects = new Map();
    this.descendants = new Map();
    this.middlewares = [];

    for (const parser of parsers) {
      this[parser.type] = (pattern, effect) => this.open(parser.pattern(pattern), effect);
    }
  }

  get docs() {
    const docs = [...this.effects.keys(), ...this.descendants.keys()].map((d) => d.docs);
    return docs;
  }

  use(middleware: Middleware): Trajectory {
    this.middlewares.push(middleware);
    return this;
  }

  open(patterns: Pattern[], effect: Effect): Trajectory {
    if (patterns.length === 0) throw new Error("Requires pattern");
    this.branch(() => patterns.slice(0, -1)).effects.set(patterns[patterns.length - 1], effect);
    return this;
  }

  branch(patternFn: any): Trajectory {
    const parsers = {};

    for (const parser of this.parsers) {
      parsers[parser.type] = parser.pattern;
    }

    const patterns = patternFn(parsers);

    if (patterns.length === 0) return this;
    //

    const firstPattern = patterns[0];
    let nextTrajectory = this.descendants.get(firstPattern);

    if (!nextTrajectory) {
      nextTrajectory = new Trajectory(this.parsers);
      this.descendants.set(firstPattern, nextTrajectory);
    }

    return patterns.length > 1 ? nextTrajectory.branch(() => patterns.slice(1)) : nextTrajectory;
  }
  // branch(patterns: Pattern[]): Trajectory {
  //   if (patterns.length === 0) return this;
  //   //

  //   const firstPattern = patterns[0];
  //   let nextTrajectory = this.descendants.get(firstPattern);

  //   if (!nextTrajectory) {
  //     nextTrajectory = new Trajectory(this.parsers);
  //     this.descendants.set(firstPattern, nextTrajectory);
  //   }

  //   return patterns.length > 1 ? nextTrajectory.branch(patterns.slice(1)) : nextTrajectory;
  // }

  match(signal: Signal): { effect?: Match<Effect>; descendant?: Match<Trajectory> } {
    for (const [pattern, effect] of this.effects.entries()) {
      const step = pattern.match(signal);
      if (step !== null) {
        return { step, effect };
      }
    }

    for (const [pattern, descendant] of this.descendants.entries()) {
      const step = pattern.match(signal);
      if (step !== null) {
        return { step, descendant };
      }
    }

    return {};
  }

  getAvailableTypes(): string[] {
    return [
      ...new Set([
        ...Array.from(this.effects.keys()).map((p) => p.type),
        ...Array.from(this.descendants.keys()).map((p) => p.type),
      ]),
    ];
  }
}

// import { Params, Signal, Pattern } from "../types.ts";
// import { compose } from "./lib.ts";

// export interface Middleware {
//   (ctx: Context, next: () => Promise<any>): Promise<any>;
// }

// export interface Context {
//   [key: string]: any;
// }

// export interface Effect {
//   (ctx: Context): Promise<any>;
// }

// export class Trajectory {
//   descendants: Map<Pattern, Trajectory>;
//   effects: Map<Pattern, Effect>;
//   middlewares: Middleware[];

//   constructor() {
//     this.effects = new Map();
//     this.descendants = new Map();
//     this.middlewares = [];
//   }

//   use(middleware: Middleware): Trajectory {
//     this.middlewares.push(middleware);
//     return this;
//   }
//   open(patterns: Pattern[], effect: Effect): Trajectory {
//     if (patterns.length === 0) throw new Error("Requires pattern");
//     this.branch(patterns.slice(0, -1)).effects.set(patterns[patterns.length - 1], effect);
//     return this;
//   }
//   // open(patterns: Pattern[], effect: Effect): Trajectory {console.log("open", patterns); if (patterns.length === 0) throw new Error("Requires pattern"); const target = this.branch(patterns.slice(0, -1)); target.effects.set(patterns[patterns.length - 1], effect); return this;}

//   branch(patterns: Pattern[]): Trajectory {
//     if (patterns.length === 0) return this;

//     const firstPattern = patterns[0];
//     let nextTrajectory = this.descendants.get(firstPattern);

//     if (!nextTrajectory) {
//       nextTrajectory = new Trajectory();
//       this.descendants.set(firstPattern, nextTrajectory);
//     }

//     return patterns.length > 1 ? nextTrajectory.branch(patterns.slice(1)) : nextTrajectory;
//   }

//   matchEffects(signal: Signal): [Params, Effect] | null {
//     for (const [pattern, effect] of this.effects.entries()) {
//       const params = pattern.match(signal);
//       if (params !== null) return [params, effect];
//     }
//     return null;
//   }

//   matchDescendants(signal: Signal): [Params, Trajectory] | null {
//     for (const [pattern, descendant] of this.descendants.entries()) {
//       const params = pattern.match(signal);
//       if (params !== null) return [params, descendant];
//     }
//     return null;
//   }

//   compose(next) {
//     return compose(this.middlewares, next);
//   }
// }

// // export interface Middleware {
// //   (ctx: Context, next: () => Promise<void>): Promise<void>;
// // }

// // export interface Context {
// //   request: any;
// //   response: any;
// //   params: Record<string, string>;
// // }

// // export interface Effect {
// //   (ctx: Context): Promise<any>;
// // }

// // export interface Destination {
// //   patterns: Pattern[];
// //   effect?: Effect;
// //   trajectory?: Trajectory;
// // }

// // export class Trajectory {
// //   descendants: Map<Pattern, Trajectory>;
// //   effects: Map<Pattern, Effect>;
// //   middleware: Array;

// //   constructor() {
// //     this.effects = new Map();
// //     this.descendants = new Map();
// //     this.middlewares = [];
// //   }
// //   use(middleware: Middleware): Aperture {
// //     this.middlewares.push(middleware);
// //     return this;
// //   }

// //   open(patterns: Pattern[], effect: Effect): Trajectory {
// //     if (patterns.length === 0) throw new Error("Requires pattern");
// //     this.branch(patterns.slice(0, -1)).effects.set(patterns[patterns.length - 1], effect);
// //     return this;
// //   }
// //   branch(patterns: Pattern[]): Trajectory {
// //     if (patterns.length === 0) {
// //       return this;
// //     }

// //     const firstPattern = patterns[0];
// //     let nextTrajectory = this.descendants.get(firstPattern);

// //     if (!nextTrajectory) {
// //       nextTrajectory = new Trajectory();
// //       this.descendants.set(firstPattern, nextTrajectory);
// //     }

// //     return nextTrajectory;
// //   }

// //     matchEffects(signal){
// //       // for [pattern, effect] of this.effects.enries()
// //       // const match = pattern.match(signal)
// //       // if (match) return [match as Params, effect]

// //     }
// //     matchDescendants(signal){
// //       // for [pattern, descendant] of this.descendants.enries()
// //       // const match = pattern.match(signal)
// //       // if (match) return [match as Params, descendant]

// //     }

// //   compose(next) {
// //     return function (context) {
// //       let index = -1;

// //       async function dispatch(i) {
// //         if (i <= index) throw new Error("next() called multiple times");

// //         index = i;
// //         let fn = this.middleware[i];

// //         if (i === this.middleware.length) fn = next;

// //         if (!fn) return;

// //         return await fn(context, dispatch.bind(null, i + 1));
// //       }

// //       return dispatch(0);
// //     };
// //   }

// // }
