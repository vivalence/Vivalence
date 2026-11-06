import { Signal } from "../../prototypes/signal.js";
import * as middleware from "../belt/middleware.js";
import { request } from "./strategy.js";

export const descend = (carry, vector) => middleware.chain(carry, middleware.compose(vector.carry));

export const at = (vector, path) =>
  path.reduce((position, nature) => {
    if (!position) return null;
    const edge = position.edge(nature);
    return edge ? edge[1] : null;
  }, vector);

const route = (steps) => new Signal(steps.map((s) => s.nature).join("/"));

export function fold(
  vector,
  step,
  frame = { carry: middleware.forward, steps: [], signal: new Signal(), signature: null },
) {
  const here = { ...frame, carry: descend(frame.carry, vector) };
  const trajectories = [...vector.trie].map(([pattern, trajectory]) =>
    fold(trajectory, step, {
      ...here,
      signature: pattern,
      steps: [...here.steps, pattern],
      signal: here.signal.branch(pattern.nature),
    }),
  );
  return step.node({ ...here, effect: vector.effect ?? undefined, trajectories });
}

export function survey(vector, visit = (node) => node, execute) {
  return fold(vector, {
    node: (f) =>
      visit({
        signature: f.signature,
        effect: f.effect,
        invoke:
          f.effect !== undefined && execute
            ? execute(f.carry, f.effect, f.steps, route(f.steps))
            : undefined,
        trajectories: f.trajectories,
        path: f.steps,
      }),
  });
}

export const leaves = (vector) =>
  fold(vector, {
    node: (f) => [
      ...(f.effect === undefined
        ? []
        : [{ pattern: f.signature, steps: f.steps, effect: f.effect, carry: f.carry }]),
      ...f.trajectories.flat(),
    ],
  });

export const rollup = (vector, execute = request) =>
  leaves(vector).map((leaf) => ({
    ...leaf,
    fn: execute(leaf.carry, leaf.effect, leaf.steps, route(leaf.steps)),
  }));

export const sieve = (vector, keep, steps = [], ancestor = undefined) => {
  const kept = new vector.constructor(ancestor, vector.signature)
    .use(...vector.carry)
    .do(vector.effect);
  for (const [pattern, trajectory] of vector.trie) {
    const path = [...steps, pattern];
    if (!keep(pattern, path)) continue;
    kept.seat(pattern, sieve(trajectory, keep, path, kept));
  }
  return kept;
};
