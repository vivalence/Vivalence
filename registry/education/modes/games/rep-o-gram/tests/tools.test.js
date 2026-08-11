import { specimen, shape } from "@vivalence/typology";
import { mountMode } from "@vivalence/runtime/scenarios";

import * as repogram from "../rep-o-gram.viva.js";

specimen.describe("rep-o-gram tools", () => {
  let scenario;
  let tools;

  specimen.beforeAll(async () => {
    scenario = await mountMode(repogram);
    tools = shape.object(scenario.mode.tools);
  });

  specimen.afterAll(async () => {
    await scenario?.orm?.close();
  });

  specimen.it("provision with axes draws from the feed and reports the session", async () => {
    await scenario.scoped(async () => {
      const result = await tools.provision({ count: 3, streak: 2 });
      const [buffer] = result.buffer;
      specimen.expect(buffer.data.streak).toBe(2);
      specimen.expect(buffer.data.gameplay).toBe("TYPE");
      specimen.expect(result.message).toContain("streak 2");
    });
  });

  specimen.it("provision with authored pairs stamps ontology and skips the retention", async () => {
    await scenario.scoped(async () => {
      const result = await tools.provision({
        knowables: [
          { known: "the train leaves at eight", learning: "o trem parte às oito" },
          { known: "a word", learning: "uma palavra" },
        ],
      });
      const [buffer] = result.buffer;
      const [sentence, word] = buffer.data.knowables;
      specimen.expect(sentence.ontology).toBe("sentence");
      specimen.expect(word.ontology).toBe("word");
      specimen.expect(sentence.literal).toBeUndefined();
    });
  });

  specimen.it("provision with symbols scopes the draw", async () => {
    await scenario.scoped(async () => {
      const result = await tools.provision({ symbols: ["greeting"], count: 5 });
      const [buffer] = result.buffer;
      const drawn = buffer.literals.getItems();
      specimen.expect(drawn.length).toBeGreaterThanOrEqual(1);
      for (const literal of drawn) {
        specimen.expect(literal.symbol.greeting).toBe(true);
      }
    });
  });
});
