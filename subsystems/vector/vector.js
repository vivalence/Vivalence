import { is } from "@vivalence/shared";
import { sig } from "./parser/index.js";

export class Vector {
  constructor(parsers = [sig]) {
    this.parsers = [...(is.array(parsers) ? parsers : [parsers])];
    this.effects = new Map(); // <Pattern, Effect>
    this.trajectories = new Map(); // <Pattern, Vector>
    this.middlewares = [];
  }

  use(middleware) {
    this.middlewares.push(middleware);
    return this;
  }

  branch(patterns) {
    patterns = this.parse(patterns);

    if (patterns.length === 0) return this;

    let descendant = Array.from(this.trajectories.entries()) //
      .find(([pattern]) => pattern.hash === patterns[0].hash)?.[1];

    if (!descendant) {
      descendant = new Vector(this.parsers);
      this.trajectories.set(patterns[0], descendant);
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
    return [...this.effects.keys(), ...this.trajectories.keys()];
  }
  get descendants() {
    return [...this.trajectories.values()];
  }
}
