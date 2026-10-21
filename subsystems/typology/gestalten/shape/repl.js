import { Vector } from "../../prototypes/vector.js";
import { Call } from "../../schematics/primitives/harness.js";

export const wire = (node, leaf, vector = new Vector(), steps = []) => {
  for (const [key, child] of Object.entries(node.branches)) {
    const path = [...steps, key];
    const [pattern, effect] = child.effect === undefined ? [{ nature: key }, undefined] : leaf(path, child.effect);
    const branch = vector.branch(pattern, new Vector());
    if (effect) branch.effect = effect;
    wire(child, leaf, branch, path);
  }
  return vector;
};

export const repl = (send) => (path, declared) => [
  { nature: path.at(-1), valence: declared.valence, chord: declared.chord, input: declared.input },
  (ctx) => send(ctx.signal),
];

export const tool = (call) => (path, declared) => [
  { nature: path.at(-1), valence: declared.valence, input: Call },
  (ctx) => call({ nature: `/${path.join("/")}`, body: ctx.input.body, flags: ctx.input.flags }),
];
