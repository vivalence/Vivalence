import { steer } from "@vivalence/typology";

export function named(commands, nature) {
  if (nature === "") return commands;
  const exact = commands.filter((command) => command.nature === nature);
  return exact.length ? exact : commands.filter((command) => command.nature.startsWith(nature));
}

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

const carried = (name, examples) => (examples.length ? `--${name}=${examples[0]}` : `--${name}=<${name}>`);

export function flagged(schema) {
  return Object.entries(schema.properties).map(([name, held]) =>
    accepts(held, "boolean") && !accepts(held, "string") ? `--${name}` : carried(name, Object.hasOwn(held, "examples") ? held.examples : [])
  );
}

const declared = (param) => param.group === "flags";

const label = (param) =>
  !declared(param) ? param.name : param.type === "boolean" ? `--${param.name}` : carried(param.name, param.examples);

const usage = (command) => command.params.map((param) => `[${label(param)}]`).join(" ");

const grouped = (commands) =>
  [...Map.groupBy(commands, (command) => command.nature.split("/")[0])].map(([noun, rows]) => ({
    title: noun,
    rows: rows.map((command) => ({ name: command.nature, usage: usage(command), note: command.valence })),
  }));

const detail = (command, flags) => ({
  title: `viva ${command.nature} ${usage(command)}`,
  groups: [{
    title: command.valence,
    rows: command.params.map((param) => ({
      name: label(param),
      usage: "",
      note: declared(param) && param.type !== "boolean" ? "" : param.description || "—",
    })),
  }],
  notes: [`also  ${flags.join("  ")}`],
});

export function listing(commands, flags) {
  if (commands.length === 1) return detail(commands[0], flags);
  return {
    title: "viva",
    groups: grouped(commands),
    notes: [
      ...(commands.length === 0 ? ["nothing matches"] : []),
      `flags  ${flags.join("  ")}`,
      "viva <prefix> --help narrows; an exact nature shows its params",
    ],
  };
}
