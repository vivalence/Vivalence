// trajectory → cliffy Command tree.
// each Pattern carries .nature (segment), .valence (description), .schema (typebox v.object).
// schema properties → positional args (cliffy `.arguments("[slug] [target]")`).
// parents with no leaf get a walking-autocomplete prompt (Prompt.Select on children).

import { cliffy } from "@vivalence/sheets";

export function compile(trajectory, run, root = new cliffy.Command()) {
  walk(trajectory, root, run, []);
  return root;
}

function walk(trajectory, command, run, naturePath) {
  for (const [pattern, descendant] of trajectory.trajectories) {
    const sub = new cliffy.Command();
    if (pattern.valence) sub.description(pattern.valence);
    walk(descendant, sub, run, [...naturePath, pattern.nature]);
    attachWalkingAutocomplete(sub, naturePath.concat(pattern.nature), run);
    command.command(pattern.nature, sub);
  }
  for (const [pattern, _effect] of trajectory.effects) {
    const leaf = new cliffy.Command();
    if (pattern.valence) leaf.description(pattern.valence);
    const argNames = applySchema(leaf, pattern.schema);
    const fullPath = [...naturePath, pattern.nature];
    leaf.action(async (options, ...positionals) => {
      const args = {};
      argNames.forEach((name, index) => (args[name] = positionals[index]));
      await run({ path: fullPath, args, options });
    });
    command.command(pattern.nature, leaf);
  }
}

// returns the ordered list of arg names so we can map positionals back by name
function applySchema(command, schema) {
  if (!schema?.properties) return [];
  const argNames = Object.keys(schema.properties);
  const tokens = argNames.map((name) => `[${name}]`).join(" ");
  if (tokens) command.arguments(tokens);
  return argNames;
}

// parent has no terminal effect of its own → on no-args invocation, prompt children.
function attachWalkingAutocomplete(parentCommand, naturePath, run) {
  parentCommand.action(async () => {
    const children = parentCommand.getCommands();
    if (!children.length) return;
    const choice = await cliffy.Prompt.Select.prompt({
      message: `/${naturePath.join("/")}`,
      options: children.map((child) => ({
        name: `${child.getName()}${child.getDescription() ? "  " + child.getDescription() : ""}`,
        value: child.getName(),
      })),
    });
    await parentCommand.parse([choice]);
  });
}
