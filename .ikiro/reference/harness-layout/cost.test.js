import { Cortex, shape, shard, specimen, steer } from "@vivalence/typology";
import { mountMode } from "@vivalence/runtime/scenarios";
import { accio } from "../../../systems/runtime/tests/scenarios/registry.js";
import * as root from "../../../commons/harnesses/runtime/runtime-harness.viva.js";
import { translateTools } from "../../../commons/hallucinators/anthropic/provider/translate.js";

const chars = (value) => JSON.stringify(value).length;
specimen.describe("what a load weighs", () => {
  specimen.it("the runtime harness and francesca, in chars as the provider receives them", async () => {
    const held = await mountMode(root, { cortex: new Cortex() });
    try {
      const mount = held.authedConn.branch("/mode/harness/runtime");
      const metadata = await mount.call("/metadata/harness");
      const sections = {};
      for (const nature of ["identity", "world", "runtime", "daemons", "modes", "threads"])
        sections[nature] = (await mount.call(`/metadata/harness/primer/${nature}`, { thread: held.fixtures.thread.id })).length;
      console.log("runtime harness primer sections (chars)", sections);
      console.log("runtime harness tools: count", steer.trie.leaves(root.tools).length, "chars", chars(translateTools(shard.hallucinate.declarations(root.tools))));
    } finally {
      await held.orm.close();
    }
    const francesca = await accio("@education/teacher/francesca");
    console.log("francesca tools: count", steer.trie.leaves(francesca.tools).length, "chars", chars(translateTools(shard.hallucinate.declarations(francesca.tools))));
    console.log("francesca primer natures", shape.primer.keys(francesca.primer), "lazy", shape.primer.lazy(francesca.primer).map((node) => node.nature));
  });
});
