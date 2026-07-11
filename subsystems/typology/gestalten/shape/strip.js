import { steer, Vector } from "@vivalence/typology";

const edgeMeta = (pattern, effect) => {
  const meta = {};
  if (pattern?.input !== undefined) meta.input = pattern.input;
  if (pattern?.output !== undefined) meta.output = pattern.output;
  if (pattern?.yields !== undefined) meta.yields = pattern.yields;
  if (effect?.methods) meta.methods = Object.keys(effect.methods);
  return meta;
};

export const strip = (vector = new Vector(), pluck = edgeMeta) =>
  steer.trie.fold(vector, {
    node: (f) => {
      const branches = Object.fromEntries(f.trajectories.map((c) => [c.key, c.node]));
      const node = { branches };
      if (f.effect !== undefined) node.effect = pluck(f.signature, f.effect);
      return f.signature ? { key: f.signature.nature, node } : node;
    },
  });
