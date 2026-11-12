import { shape, specimen, steer, v, Vector } from "@vivalence/typology";
import { accio } from "../../../systems/runtime/tests/scenarios/registry.js";

const typed = (schema) =>
  Object.entries(schema?.properties ?? {})
    .map(([key, field]) => `${(schema.required ?? []).includes(key) ? key : `${key}?`}: ${field.type ?? "any"}`)
    .join(" · ");
const side = (label, schema) =>
  schema ? [`  ${label} ${typed(schema)}`, ...(schema.examples ?? []).map((example) => `  e.g. ${JSON.stringify(example)}`)] : [];
const address = (mode, steps) => [mode.manifest.type, mode.manifest.slug, ...steps.map((step) => step.nature.replace(/^\//, ""))].join("/");
const index = (modes) =>
  modes
    .flatMap((mode) => [
      ...steer.trie.leaves(mode.tools ?? new Vector()).flatMap(({ pattern, steps }) => [
        `tool /${address(mode, steps)}`,
        `  ${pattern.valence}`,
        ...side("input", pattern.input),
        ...side("output", pattern.output),
      ]),
      ...(mode.primer ? shape.primer.lazy(new Vector().graft(mode.primer)).concat(shape.primer.keys(mode.primer).map((nature) => ({ nature }))) : [])
        .flatMap((node) => [`primer /${mode.manifest.type}/${mode.manifest.slug}/${node.nature}`, ...(node.valence ? [`  ${node.valence}`] : [])]),
    ])
    .join("\n");

specimen.describe("modes/index", () => {
  specimen.it("harvest and nyan, as the model reads them", async () => {
    const modes = [await accio("@education/tactic/harvest"), await accio("@education/game/nyan")];
    console.log(`\n${index(modes)}`);
  });
});
