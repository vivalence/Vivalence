import { steer } from "@vivalence/typology";

export function census(trajectory) {
  return steer.trie.fold(trajectory, {
    node: (frame) => {
      const rows = frame.trajectories.flat();
      if (frame.effect === undefined) return rows;
      const nature = frame.steps.map((step) => step.nature).join("/");
      const params = Object.entries(frame.signature?.schema?.properties ?? {}).map(
        ([name, property]) => ({ name, description: property.description ?? "" }),
      );
      return [{ nature, valence: frame.signature?.valence ?? "", params }, ...rows];
    },
  });
}
