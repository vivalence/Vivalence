import { Signal, middleware } from "@vivalence/typology";
import { request } from "./strategy.js";

// TREE family — enumerate the WHOLE vector (every effect + every trajectory).
// Counterpart: walk.js, which descends a single Signal path. Do not cross-compare.

// the carry-descend step (debt #1, named once): fold this node's middleware onto the
// accumulated carry, root outermost (the onion — an ordered path-fold, by design).
export const descend = (carry, vector) => middleware.chain(carry, middleware.compose(vector.carry));

// the tree catamorphism. Threads an IMMUTABLE frame {carry, steps, signal, signature}
// down the vector — no `carry =` reassignment, no `steps.push`. step.effect folds each
// leaf; step.node folds a node from its children. survey/rollup/shape.object are thin
// steps over this ONE combinator. (frame.signature is null at the root, the node's own
// pattern below it — lets a consumer treat the root specially, e.g. survey's asymmetry.)
export function fold(
  vector,
  step,
  frame = { carry: middleware.forward, steps: [], signal: new Signal(), signature: null },
) {
  const here = { ...frame, carry: descend(frame.carry, vector) };
  const effects = [...vector.effects].map(([pattern, effect]) =>
    step.effect({ ...here, pattern, effect, steps: [...here.steps, pattern] }));
  const trajectories = [...vector.trajectories].map(([pattern, child]) =>
    fold(child, step, {
      ...here,
      signature: pattern,
      steps: [...here.steps, pattern],
      signal: here.signal.branch(pattern.nature),
    }));
  return step.node({ ...here, effects, trajectories });
}

// visit every effect + node. The ROOT node stays unwrapped (signature null);
// descendants are visited with their signature — the historical asymmetry, preserved.
export function survey(vector, visit = (node) => node, execute) {
  return fold(vector, {
    effect: (f) =>
      visit({
        signature: f.pattern,
        effect: f.effect,
        invoke: execute ? execute(f.carry, f.effect, f.steps, f.signal.branch(f.pattern.nature)) : undefined,
        path: f.steps,
      }),
    node: (f) =>
      f.signature
        ? visit({ signature: f.signature, effects: f.effects, trajectories: f.trajectories, path: f.steps })
        : { effects: f.effects, trajectories: f.trajectories },
  });
}

// flatten every effect into a pre-order entry list, each with its compiled fn.
export function rollup(vector, execute = request) {
  const entries = [];
  fold(vector, {
    effect: (f) => {
      entries.push({
        pattern: f.pattern,
        steps: f.steps,
        fn: execute(f.carry, f.effect, f.steps, f.signal.branch(f.pattern.nature)),
      });
    },
    node: () => null,
  });
  return entries;
}
