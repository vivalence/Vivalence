import { steer } from "@vivalence/typology";

export function agentic(vector, separator = "_") {
  const entries = steer.rollup(vector, steer.guarded);

  const tools = {};
  const lines = ["### Tools"];

  for (const { pattern, steps, fn } of entries) {
    const name = steps.map((step) => step.nature).join(separator);

    lines.push(`"${name}":`);
    if (pattern.valence) lines.push(`${pattern.valence}`);
    if (pattern.input) lines.push(`- input: ${JSON.stringify(pattern.input)}`);
    if (pattern.output) lines.push(`- output: ${JSON.stringify(pattern.output)}`);

    tools[name] = {
      valence: pattern.valence ?? "",
      input: pattern.input,
      output: pattern.output,
      execute: fn,
    };
  }

  return { tools, llmstxt: "\n" + lines.join("\n") + "\n" };
}
