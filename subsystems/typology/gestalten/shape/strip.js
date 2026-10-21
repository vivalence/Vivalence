import * as steer from "../steer/index.js";
import { Vector } from "../../prototypes/vector.js";

const edgeMeta = (pattern, effect) => {
  const meta = {};
  if (pattern?.input !== undefined) meta.input = pattern.input;
  if (pattern?.output !== undefined) meta.output = pattern.output;
  if (pattern?.yields !== undefined) meta.yields = pattern.yields;
  if (pattern?.feeds !== undefined) meta.feeds = pattern.feeds;
  if (pattern?.valence !== undefined) meta.valence = pattern.valence;
  if (effect?.methods) meta.methods = Object.keys(effect.methods);
  return meta;
};

export const strip = (vector = new Vector(), pluck = edgeMeta) =>
  steer.trie.fold(vector, {
    node: (f) => {
      const branches = Object.fromEntries(f.trajectories.map((c) => [c.key, c.node]));
      const node = { branches };
      if (f.signature && f.effect === undefined && Object.keys(pluck(f.signature)).length > 0) node.meta = pluck(f.signature);
      if (f.effect !== undefined) node.effect = pluck(f.signature, f.effect);
      return f.signature ? { key: f.signature.nature, node } : node;
    },
  });
