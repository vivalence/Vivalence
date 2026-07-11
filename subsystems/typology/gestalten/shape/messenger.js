import { Vector } from "@vivalence/typology";
import { object } from "./object.js";

export function messenger(stripped, { socket }) {
  return object(rehydrate(stripped, socket));
}

function rehydrate(node, socket, prefix = "") {
  const vector = new Vector();
  if (node?.effect) {
    const signal = prefix || "/";
    vector.affect(async (ctx) => {
      socket.push(signal, ctx.input);
    });
  }
  for (const [segment, child] of Object.entries(node?.branches ?? {})) {
    vector.branch(segment).slurp(rehydrate(child, socket, joinSignal(prefix, segment)));
  }
  return vector;
}

function joinSignal(prefix, nature) {
  return prefix ? `${prefix}/${nature}` : `/${nature}`;
}
