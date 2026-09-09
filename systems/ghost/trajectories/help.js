import { steer } from "@vivalence/typology";

export function census(trajectory) {
  return steer.trie.fold(trajectory, {
    node: (frame) => {
      const rows = frame.trajectories.flat();
      if (frame.effect === undefined) return rows;
      const nature = frame.steps.map((step) => step.nature).join("/");
      const params = Object.entries(frame.signature?.schema?.properties ?? {}).map(
        ([name, property]) => ({
          name,
          type: property.type ?? "string",
          group: property.group ?? null,
          examples: property.examples ?? [],
          description: property.description ?? "",
        }),
      );
      return [{ nature, valence: frame.signature?.valence ?? "", params }, ...rows];
    },
  });
}

export const accepts = (held, type) => held.type === type || (held.anyOf ?? []).some((one) => one.type === type);

// a flag that carries nothing prints bare; one that carries a value prints its shape.
export function flagged(schema) {
  return Object.entries(schema.properties).map(([name, held]) =>
    accepts(held, "boolean") && !accepts(held, "string") ? `--${name}` : `--${name}=${held.description}`
  );
}
