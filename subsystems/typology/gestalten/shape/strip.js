import { steer, Vector } from "@vivalence/typology";

const leafFrom = (pattern) => {
  const leaf = { nature: pattern.nature };
  if (pattern.input !== undefined) leaf.input = pattern.input;
  if (pattern.output !== undefined) leaf.output = pattern.output;
  return leaf;
};

export const strip = (vector = new Vector(), pluck = leafFrom) =>
  steer.trie.fold(vector, {
    node: (f) => {
      const leaves = f.trajectories.filter((c) => c.leaf !== undefined).map((c) => c.leaf);
      const branches = Object.fromEntries(
        f.trajectories.filter((c) => c.stripped !== undefined).map((c) => [c.nature, c.stripped]));
      const stripped = { leaves, branches };
      if (!f.signature) return stripped;
      return {
        nature: f.signature.nature,
        leaf: f.effect !== undefined ? pluck(f.signature) : undefined,
        stripped: f.trajectories.length ? stripped : undefined,
      };
    },
  });
