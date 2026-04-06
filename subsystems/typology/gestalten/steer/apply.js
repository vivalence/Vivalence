import { Signal, middleware } from "@vivalence/typology";
import { NotFound } from "@vivalence/typology";
import { traverse } from "./navigate.js";
import { scope } from "./match.js";
import { dispatch, request, guarded } from "./strategy.js";

export function invoke(vector, signal, execute = request) {
  signal = new Signal(signal);
  const [effect, carry, steps] = traverse(vector, signal);
  if (!effect) throw new NotFound(signal);
  return execute(carry, effect, steps, signal);
}

export function shotgun(vector, signal, execute = request) {
  signal = new Signal(signal);
  let position = vector;
  let carry = middleware.forward;
  let steps = [];

  for (let i = 0; i < signal.array.length; i++) {
    const seg = signal.array[i];
    const matches = scope(position, seg);

    carry = middleware.chain(carry, middleware.compose(position.carry));

    if (i === signal.array.length - 1) {
      return matches
        .filter(([, , effect]) => effect)
        .map(([match, , effect]) => execute(carry, effect, [...steps, match], signal));
    }

    const trajectory = matches.find(([, t]) => t);
    if (!trajectory) return [];
    steps.push(trajectory[0]);
    position = trajectory[1];
  }

  return [];
}

export function rollup(vector, execute = request) {
  const entries = [];

  function walk(vector, carry, steps, signal) {
    carry = middleware.chain(carry, middleware.compose(vector.carry));

    for (const [pattern, effect] of vector.effects) {
      const path = [...steps, pattern];
      entries.push({
        pattern,
        steps: path,
        fn: execute(carry, effect, path, signal.branch(pattern.nature)),
      });
    }

    for (const [pattern, descendant] of vector.trajectories) {
      walk(descendant, carry, [...steps, pattern], signal.branch(pattern.nature));
    }
  }

  walk(vector, middleware.forward, [], new Signal());
  return entries;
}
