import { TraversalError } from "../types/error.js";

export class Walker {
  constructor(vector, deferred) {
    this.vector = vector;
    this.stack = [];
    this.resolved = false;
    this.deferred = deferred;
  }

  resolve(effect) {
    this.resolved = true;
    this.deferred.resolve((input, context) => {
      return this.compose(this.stack)(input, context, effect);
    });
  }

  match(signal) {
    for (const [pattern, effect] of this.vector.effects.entries()) {
      const match = pattern.match(signal);
      if (match !== null) {
        return { signal, pattern, match, effect };
      }
    }

    for (const [pattern, descendant] of this.vector.descendants.entries()) {
      const match = pattern.match(signal);
      if (match !== null) {
        return { signal, pattern, match, descendant };
      }
    }

    return null;
  }

  async traverse(signal) {
    this.stack = [...this.stack, ...this.vector.middlewares];

    const match = this.match(signal);

    if (!match) {
      const vectorTypes = Array.from(
        new Set(this.vector.patterns.map((p) => p.type)),
      );
      if (!vectorTypes.includes(signal.type)) {
        throw new TraversalError(signal, "PATTERN_TYPE_NOT_FOUND");
      } else {
        throw new TraversalError(signal, "NO_PATTERN_MATCHED");
      }
    } else if (match.effect) {
      this.resolve(match.effect);
    } else if (match.descendant) {
      this.vector = match.descendant;
    }

    return match;
  }

  async walk(signals = [], getSignal) {
    const steps = [];
    let maxSteps = 20;

    try {
      while (!this.resolved) {
        if (0 > maxSteps--) throw new TraversalError(null, "MAX_STEPS_REACHED");

        if (signals.length > 0) {
          steps.push(await this.traverse(signals.shift()));
        } else {
          const vectorDocs = this.vector.patterns.map(
            (pattern) => pattern.docs,
          );
          signals.push(...(await getSignal(vectorDocs)));
        }
      }
    } catch (error) {
      steps.push({ error });
      if (!this.resolved) {
        this.resolved = true;
        this.deferred.reject(error);
      }
    } finally {
      return steps;
    }
  }

  compose(middleware) {
    if (!Array.isArray(middleware))
      throw new TypeError("Middleware stack must be an array!");

    return function (input, context, next) {
      let index = -1;

      function dispatch(i) {
        if (i <= index)
          return Promise.reject(new Error("next() called multiple times"));

        index = i;

        let fn = middleware[i];
        if (i === middleware.length) fn = next;
        if (!fn) return Promise.resolve(input, context);

        try {
          return Promise.resolve(fn(input, context, () => dispatch(i + 1)));
        } catch (err) {
          return Promise.reject(err);
        }
      }

      return dispatch(0);
    };
  }
}
