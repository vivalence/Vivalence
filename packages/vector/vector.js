import { is } from "@vivalence/shared";

export class Vector {
  constructor(parsers) {
    this.parsers = [...(is.array(parsers) ? parsers : [parsers])];
    this.effects = new Map(); // <Pattern, Effect>
    this.descendants = new Map(); // <Pattern, Vector>
    this.middlewares = [];
  }

  use(middleware) {
    this.middlewares.push(middleware);
    return this;
  }

  branch(patterns) {
    patterns = this.parse(patterns);

    if (patterns.length === 0) return this;

    let descendant = Array.from(this.descendants.entries()) //
      .find(([pattern]) => pattern.hash === patterns[0].hash)?.[1];

    if (!descendant) {
      descendant = new Vector(this.parsers);
      this.descendants.set(patterns[0], descendant);
    }

    return patterns.length > 1
      ? descendant.branch(() => patterns.slice(1))
      : descendant;
  }

  open(patterns, effect) {
    patterns = this.parse(patterns);

    if (patterns.length === 0) throw new Error("Requires pattern");

    this.branch(() => patterns.slice(0, -1)) //
      .effects.set(patterns[patterns.length - 1], effect);

    return this;
  }

  parse(patterns) {
    if (is.fn(patterns)) {
      patterns = patterns(
        this.parsers.reduce((a, p) => ((a[p.parser] = p.pattern), a), {}),
      );
    } else if (!is.array(patterns)) {
      patterns = this.parsers[0].pattern(patterns);
    }
    return patterns;
  }

  get patterns() {
    return [...this.effects.keys(), ...this.descendants.keys()];
  }
}

// import type { Match, Middleware, Context, Effect } from "../types/index.ts";
// import { is } from "@vivalence/shared";
// import { Signal, Pattern } from "../types/index.ts";

// export class Vector {
//   descendants: Map<Pattern, Vector>;
//   effects: Map<Pattern, Effect>;
//   middlewares: Middleware[];

//   constructor(parsers: any | null) {
//     this.parsers = parsers || [];

//     this.effects = new Map();
//     this.descendants = new Map();

//     this.middlewares = [];
//   }

//   use(middleware: Middleware): Vector {
//     this.middlewares.push(middleware);
//     return this;
//   }

//   parse(patterns: any | Pattern[] | PatternFunction) {
//     if (is.fn(patterns)) {
//       patterns = patterns(this.parserFunctions);
//     } else if (!is.array(patterns)) {
//       patterns = this.parsers[0].pattern(patterns);
//     }
//     return patterns;
//   }

//   branch(patterns: any): Vector {
//     patterns = this.parse(patterns);

//     if (patterns.length === 0) return this;

//     let descendant = Array.from(this.descendants.entries()) //
//       .find(([pattern]) => pattern.hash === patterns[0].hash)?.[1];

//     if (!descendant) {
//       descendant = new Vector(this.parsers);
//       this.descendants.set(patterns[0], descendant);
//     }

//     return patterns.length > 1
//       ? descendant.branch(() => patterns.slice(1))
//       : descendant;
//   }
//   open(patterns: any, effect: Effect): Vector {
//     patterns = this.parse(patterns);

//     if (patterns.length === 0) throw new Error("Requires pattern");

//     this.branch(() => patterns.slice(0, -1)) //
//       .effects.set(patterns[patterns.length - 1], effect);

//     return this;
//   }

//   // // find(signal: Signal): Match[]
//   // match(signal: Signal): Match {
//   //   for (const [pattern, effect] of this.effects.entries()) {
//   //     const match = pattern.match(signal);
//   //     if (match !== null) {
//   //       return { signal, pattern, match, effect };
//   //     }
//   //   }

//   //   for (const [pattern, descendant] of this.descendants.entries()) {
//   //     const match = pattern.match(signal);
//   //     if (match !== null) {
//   //       return { signal, pattern, match, descendant };
//   //     }
//   //   }

//   //   return null;
//   // }

//   get parserFunctions() {
//     return this.parsers.reduce((a, p) => ((a[p.type] = p.pattern), a), {});
//   }

//   get patterns() {
//     return [...this.effects.keys(), ...this.descendants.keys()];
//   }

//   get docs() {
//     return this.patterns.map((pattern) => pattern.docs);
//   }

//   get types() {
//     return Array.from(new Set(this.patterns.map((p) => p.type)));
//   }
// }
