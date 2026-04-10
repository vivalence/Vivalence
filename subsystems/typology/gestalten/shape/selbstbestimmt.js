import { middleware, steer } from "@vivalence/typology";

export function selbstbestimmt(vector, strategy = steer.bare) {
  const walk = (node) => {
    for (const effect of node.effects.values()) return [effect, [...node.carry]];
    for (const trajectory of node.trajectories.values()) {
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
