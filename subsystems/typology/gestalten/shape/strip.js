import { steer, Vector } from "@vivalence/typology";

// default leaf-builder: an effect's pattern → its contract descriptor (nature + the
// input/output schemas when present). Overridable via strip's second arg.
const leafFrom = (pattern) => {
  const leaf = { nature: pattern.nature };
  if (pattern.input !== undefined) leaf.input = pattern.input;
  if (pattern.output !== undefined) leaf.output = pattern.output;
  return leaf;
};

// the contract serializer: a Vector trie → {leaves, branches} JSON. Consumed by the
// /metadata aperture+emitter endpoints, the conversation handshake, and
// shape.connection.wire. A textbook tree catamorphism — a thin step over steer.trie.fold:
// `pluck` maps each effect to a leaf (defaulting to leafFrom — pass your own to
// serialize a different contract); step.node assembles {leaves, branches}, keying each
// branch by its segment. The root (signature null) returns the bare contract;
// descendants carry {nature, stripped} so the parent can key them.
export const strip = (vector = new Vector(), pluck = leafFrom) =>
  steer.trie.fold(vector, {
    effect: (f) => pluck(f.pattern),
    node: (f) => {
      const stripped = {
        leaves: f.effects,
        branches: Object.fromEntries(f.trajectories.map((child) => [child.nature, child.stripped])),
      };
      return f.signature ? { nature: f.signature.nature, stripped } : stripped;
    },
  });
