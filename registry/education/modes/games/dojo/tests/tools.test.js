import { specimen, shape } from "@vivalence/typology";
import { mountMode } from "@vivalence/runtime/scenarios";

import * as dojo from "../dojo.viva.js";
import * as knowables from "../buffer/knowables.js";

specimen.describe("dojo tools", () => {
  let scenario;
  let tools;

  specimen.beforeAll(async () => {
    scenario = await mountMode(dojo);
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

  specimen.it("provision with a declared set pins literals by slug and carries the axes", async () => {
    await scenario.scoped(async () => {
      const [pinned] = await scenario.daemon.entities.literal.find({}, { limit: 1 });
      const result = await tools.provision({
        set: [{ pick: "literals", literals: [pinned.slug] }],
        streak: 2,
        random: "OFF",
      });
      const [buffer] = result.buffer;
      const drawn = buffer.literals.getItems();
      specimen.expect(drawn.map((literal) => literal.slug)).toEqual([pinned.slug]);
      specimen.expect(buffer.data.set).toEqual([{ pick: "literals", literals: [pinned.slug] }]);
      specimen.expect(buffer.data.streak).toBe(2);
      specimen.expect(buffer.data.random).toBe("OFF");
    });
  });

  specimen.it("every tool buffer survives the wire and admits playable knowables — the client's own fold", async () => {
    await scenario.scoped(async () => {
      const terminal = { daemon: { getAsset: () => null } };
      const emissions = [
        await tools.provision({ count: 3 }),
        await tools.provision({ symbols: ["greeting"], count: 3 }),
        await tools.provision({ knowables: [{ known: "a word", learning: "uma palavra" }] }),
        await tools.preset({ preset: "write", count: 3 }),
      ];
      for (const emission of emissions) {
        const [minted] = emission.buffer;
        const wired = JSON.parse(JSON.stringify(minted.toJSON?.() ?? minted));
        const admitted = knowables.carried(terminal, wired);
        specimen.expect(admitted.length).toBeGreaterThanOrEqual(1);
        for (const knowable of admitted) {
          specimen.expect(typeof knowable.known).toBe("string");
          specimen.expect(typeof knowable.learning).toBe("string");
        }
      }
    });
  });

  specimen.it("generate composes runnable LLM-judged sentences — cortex stubbed", async () => {
    await scenario.scoped(async () => {
      const stubbed = {
        hallucinate: {
          object: {
            render: async () => ({
              output: {
                object: {
                  sentences: [
                    { known: "Good morning, how are you?", learning: "Bom dia, como vai?" },
                    { known: "Thank you very much", learning: "Muito obrigado" },
                  ],
                },
              },
            }),
          },
        },
      };
      const original = Object.getOwnPropertyDescriptor(scenario.daemon, "cortex");
      Object.defineProperty(scenario.daemon, "cortex", { value: stubbed, configurable: true });
      try {
        const result = await tools.generate({ count: 2 });
        const [minted] = result.buffer;
        const wired = JSON.parse(JSON.stringify(minted.toJSON?.() ?? minted));
        const admitted = knowables.carried({ daemon: { getAsset: () => null } }, wired);
        specimen.expect(admitted.length).toBe(2);
        for (const knowable of admitted) {
          specimen.expect(knowable.judge).toBe("LLM");
          specimen.expect(knowable.ontology).toBe("sentence");
        }
      } finally {
        if (original) Object.defineProperty(scenario.daemon, "cortex", original);
        else delete scenario.daemon.cortex;
      }
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
