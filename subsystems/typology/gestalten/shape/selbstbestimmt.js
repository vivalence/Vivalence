import { middleware, steer } from "@vivalence/typology";

export function selbstbestimmt(vector, strategy = steer.strategy.bare) {
  const walk = (node) => {
    if (node.effect != null) return [node.effect, [...node.carry]];
    for (const { trajectory } of node.trie.values()) {
      const found = walk(trajectory);
      if (found) return [found[0], [...node.carry, ...found[1]]];
    }
    return null;
  };

  const found = walk(vector);
  if (!found) throw new Error("shape.selbstbestimmt: no effect reachable");
  const [effect, carry] = found;
  return strategy(middleware.compose(carry), effect, [], null);
}
