import { shape, shard, specimen } from "@vivalence/typology";
import { accio } from "../../../systems/runtime/tests/scenarios/registry.js";

const MODES = ["teacher/francesca", "tactic/harvest", "game/dojo", "game/cocina", "game/nyan"];

specimen.describe("modes of the education daemon", () => {
  specimen.it("address, traits, tools, primer sections", async () => {
    for (const address of MODES) {
      const mode = await accio(`@education/${address}`);
      const tools = mode.tools ? shard.hallucinate.declarations(mode.tools).map((tool) => tool.name) : [];
      const primer = mode.primer ? shape.primer.keys(mode.primer) : [];
      console.log(
        ["", `/${mode.manifest.type}/${mode.manifest.slug}`, `traits ${mode.manifest.traits.join(" ")}`,
          ...tools.map((name) => `tool /${mode.manifest.type}/${mode.manifest.slug}/${name.replaceAll("_", "/")}`), ...primer.map((key) => `primer /${mode.manifest.type}/${mode.manifest.slug}/${key}`)].join("\n"),
      );
    }
  });
});
