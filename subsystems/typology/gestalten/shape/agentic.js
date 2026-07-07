import { steer } from "@vivalence/typology";

export function agentic(vector, separator = "_") {
  const entries = steer.trie.rollup(vector, steer.strategy.guarded);

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
// export class Agentic {
//   traverse(ancestorPath = "/", trajectory = this.trajectory) {
//     for (const [pattern, effect] of trajectory.effects.entries()) {
//       const nodePath = `${ancestorPath}${pattern.docs.segment}`;
//       this.onEffect(nodePath, pattern.docs);
//       this.onTool(nodePath, effect, pattern.docs);
//     }
//     for (const [pattern, descendant] of trajectory.descendants.entries()) {
//       const nodePath = `${ancestorPath}${pattern.docs.segment}/`;
//       this.onPattern(nodePath, pattern.docs);
//       this.traverse(nodePath, descendant);
//     }
//   }
//   onTool(path, effect, docs) {
//     this.tools[this.denormalize(path)] = {
//       valence: docs.valence, input: docs.input,
//       execute: async (input) => {
//         const deferred = new Deferred();
//         const walker = new Walker(this.trajectory, deferred);
//         await walker.walk(parser.signal(path), async () => {
//           throw new Error(`No handler ${path}`);
//         });
//         return (await deferred.handler)(input, {});
//       },
//     };
//   }
//   denormalize(path) { return path.replaceAll("/", "_").slice(1); }
// }
