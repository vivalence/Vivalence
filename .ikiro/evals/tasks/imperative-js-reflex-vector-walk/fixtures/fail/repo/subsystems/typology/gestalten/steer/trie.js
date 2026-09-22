import { Signal, middleware } from "@vivalence/typology";
import { request } from "./strategy.js";

export const descend = (carry, vector) => middleware.chain(carry, middleware.compose(vector.carry));

const route = (steps) => new Signal(steps.map((s) => s.nature).join("/"));

export function fold(
  vector,
  step,
  frame = { carry: middleware.forward, steps: [], signal: new Signal(), signature: null },
) {
  const here = { ...frame, carry: descend(frame.carry, vector) };
  const trajectories = [...vector.trie.values()].map(({ pattern, trajectory }) =>
    fold(trajectory, step, {
      ...here,
      signature: pattern,
      steps: [...here.steps, pattern],
      signal: here.signal.branch(pattern.nature),
    }),
  );
  return step.node({ ...here, effect: vector.effect ?? undefined, trajectories });
}

export function rollup(vector, execute = request) {
  const entries = [];
  fold(vector, {
    node: (f) => {
      if (f.effect !== undefined)
        entries.push({
          pattern: f.signature,
          steps: f.steps,
          fn: execute(f.carry, f.effect, f.steps, route(f.steps)),
        });
      return null;
    },
  });
  return entries;
}

export function natures(vector, out = []) {
  if (vector.effect !== undefined) out.push(String(vector.nature ?? "").replace(/^[/]/, ""));
  for (const { pattern, trajectory } of vector.trie.values()) {
    for (const nature of natures(trajectory)) out.push(nature || pattern.nature.replace(/^[/]/, ""));
  }
  return out;
}
