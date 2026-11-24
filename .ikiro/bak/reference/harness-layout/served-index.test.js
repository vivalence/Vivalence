import { shape, specimen } from "@vivalence/typology";
import { accio } from "../../../systems/runtime/tests/scenarios/registry.js";

const typed = (schema) =>
  Object.entries(schema.properties ?? {})
    .map(([key, field]) => `${(schema.required ?? []).includes(key) ? key : `${key}?`}: ${field.type ?? "any"}`)
    .join(" · ");
const side = (label, schema) =>
  schema ? [`  ${label} ${typed(schema)}`, ...(schema.examples ?? []).map((example) => `  e.g. ${JSON.stringify(example)}`)] : [];
const outline = (address, node) => [
  ...(node.effect ? [`tool ${address}`, `  ${node.effect.valence}`, ...side("input", node.effect.input), ...side("output", node.effect.output)] : []),
  ...Object.entries(node.branches).flatMap(([key, child]) => outline(`${address}/${key}`, child)),
];

specimen.describe("modes/index, from what each mode serves", () => {
  specimen.it("harvest and nyan, read from their served strips", async () => {
    const harvest = await accio("@education/tactic/harvest");
    const nyan = await accio("@education/game/nyan");
    const served = (mode) => JSON.parse(JSON.stringify({ tools: shape.strip(mode.tools) }));
    const strips = {
      "/daemon/education/mode/tactic/harvest": served(harvest),
      "/daemon/education/mode/game/nyan": served(nyan),
    };
    console.log(`\n${JSON.stringify(strips["/daemon/education/mode/tactic/harvest"].tools.branches.drain, null, 2)}`);
    console.log(`\n${Object.entries(strips).flatMap(([address, strip]) => outline(address, strip.tools)).join("\n")}`);
  });
});
