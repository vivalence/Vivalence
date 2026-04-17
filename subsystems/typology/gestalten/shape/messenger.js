import { Vector } from "@vivalence/typology";
import { object } from "./object.js";

export function messenger(stripped, { socket }) {
  return object(rehydrate(stripped, socket));
}

// @beef suboptimal, uninspired
function rehydrate(stripped, socket, prefix = "") {
  const vector = new Vector();
  for (const leaf of stripped.leaves ?? []) {
    const signal = joinSignal(prefix, leaf.nature);
    vector.open(leaf.nature, async (ctx) => {
      socket.push(signal, ctx.input);
    });
  }
  for (const [segment, sub] of Object.entries(stripped.branches ?? {})) {
    const branchSignal = joinSignal(prefix, segment);
    vector.branch(segment).slurp(rehydrate(sub, socket, branchSignal));
  }
  return vector;
}

function joinSignal(prefix, nature) {
  return prefix ? `${prefix}/${nature}` : `/${nature}`;
}
