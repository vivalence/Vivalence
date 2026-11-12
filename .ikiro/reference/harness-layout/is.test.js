import { Cortex, specimen } from "@vivalence/typology";
import { mountMode } from "@vivalence/runtime/scenarios";
import * as root from "../../../commons/harnesses/runtime/runtime-harness.viva.js";

specimen.describe("the composition today", () => {
  specimen.it("/metadata/harness of the runtime harness, whole", async () => {
    const held = await mountMode(root, { cortex: new Cortex() });
    try {
      const metadata = await held.authedConn.branch("/mode/harness/runtime").call("/metadata/harness");
      Deno.writeTextFileSync(Deno.args[0], JSON.stringify({ primer: metadata.primer, tools: metadata.tools }, null, 2));
    } finally {
      await held.orm.close();
    }
  });
});
