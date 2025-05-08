import type { Match, Middleware, Context, Effect } from "../types/index.ts";
import { Signal, Pattern } from "../types/index.ts";
import { compose } from "./lib.ts";

export class Trajectory {
  descendants: Map<Pattern, Trajectory>;
  effects: Map<Pattern, Effect>;
  middlewares: Middleware[];

  constructor(parsers: any | null) {
    this.parsers = parsers || [];
    this.effects = new Map();
    this.descendants = new Map();
    this.middlewares = [];

    // for (const parser of parsers) {this[parser.type] = (pattern, effect) => this.open(parser.pattern(pattern), effect);}
  }

  get parser() {
    return this.parsers.reduce((a, p) => ((a[p.type] = p.pattern), a), {});
  }

  get patterns() {
    return [...this.effects.keys(), ...this.descendants.keys()];
  }

  get docs() {
    return this.patterns.map((pattern) => pattern.docs);
  }

  get types() {
    return Array.from(new Set(this.patterns.map((p) => p.type)));
  }

  use(middleware: Middleware): Trajectory {
    this.middlewares.push(middleware);
    return this;
  }

  open(patterns: Pattern[] | PatternFunction, effect: Effect): Trajectory {
    if (typeof patterns === "function") {
      patterns = patterns(this.parser);
    }
    if (patterns.length === 0) throw new Error("Requires pattern");
    this.branch(() => patterns.slice(0, -1)) //
      .effects.set(patterns[patterns.length - 1], effect);

    return this;
  }

  branch(patterns: Pattern[] | PatternFunction): Trajectory {
    if (typeof patterns === "function") {
      patterns = patterns(this.parser);
    }

    if (patterns.length === 0) return this;

    let descendant = Array.from(this.descendants.entries()) //
      .find(([pattern]) => pattern.hash === patterns[0].hash)?.[1];

    if (!descendant) {
      descendant = new Trajectory(this.parsers);
      this.descendants.set(patterns[0], descendant);
    }

    return patterns.length > 1
      ? descendant.branch(() => patterns.slice(1))
      : descendant;
  }

  match(signal: Signal): Match {
    for (const [pattern, effect] of this.effects.entries()) {
      const match = pattern.match(signal);
      if (match !== null) {
        return { signal, pattern, match, effect };
      }
    }

    for (const [pattern, descendant] of this.descendants.entries()) {
      const match = pattern.match(signal);
      if (match !== null) {
        return { signal, pattern, match, descendant };
      }
    }

    return null;
  }

  // branch(patterns: Pattern[]): Trajectory {if (patterns.length === 0) return this; const firstPattern = patterns[0]; let nextTrajectory = this.descendants.get(firstPattern); if (!nextTrajectory) {nextTrajectory = new Trajectory(this.parsers); this.descendants.set(firstPattern, nextTrajectory);} return patterns.length > 1 ? nextTrajectory.branch(patterns.slice(1)) : nextTrajectory;}
}
