import { specimen, Cortex } from "@vivalence/typology";

function makeService(slug, faculties) {
  return {
    manifest: { owner: "@vivalence", type: "hallucinator", slug },
    provider: async (mask) => faculties.map((faculty) => ({ ...faculty, secret: mask.secrets[slug] })),
  };
}

specimen.describe("Cortex hallucinators", () => {
  specimen.it("a hallucinator roster registers into one cortex", async () => {
    const services = [
      {
        service: makeService("anthropic", [
          { type: "dialogue", id: "dialogue-1", tune: [0.4, 0.6, 0.6, 0.6], via: { stream: async function* () {} } },
        ]),
        mask: { module: "@vivalence/hallucinator/anthropic", secrets: { anthropic: "key-a" } },
      },
      {
        service: makeService("elevenlabs", [
          { type: "speech", id: "speech-2", tune: [0.3, 0.5, 0.5, 0.1], via: { stream: async function* () {} } },
        ]),
        mask: { module: "@vivalence/hallucinator/elevenlabs", secrets: { elevenlabs: "key-e" } },
      },
      {
        service: makeService("deepgram", [
          { type: "verbatim", id: "verbatim-3", tune: [0.4, 0.6, 0.5, 0.1], via: { stream: async function* () {} } },
        ]),
        mask: { module: "@vivalence/hallucinator/deepgram", secrets: { deepgram: "key-d" } },
      },
    ];

    const cortex = new Cortex();
    for (const { service, mask } of services) {
      cortex.register(await service.provider(mask));
    }

    specimen.expect(cortex.find({ type: "dialogue" }).length).toBeGreaterThan(0);
    specimen.expect(cortex.find({ type: "speech" }).length).toBeGreaterThan(0);
    specimen.expect(cortex.find({ type: "verbatim" }).length).toBeGreaterThan(0);

    const speech = cortex.findOne({ type: "speech", tier: "eager" });
    specimen.expect(speech.type).toBe("speech");
    specimen.expect(speech.secret).toBe("key-e");

    const verbatim = cortex.findOne({ type: "verbatim", tier: "eager" });
    specimen.expect(verbatim.type).toBe("verbatim");
    specimen.expect(verbatim.secret).toBe("key-d");
  });

  specimen.it("an empty roster leaves the cortex barren", async () => {
    const cortex = new Cortex();
    for (const { service, mask } of []) {
      cortex.register(await service.provider(mask));
    }
    specimen.expect(cortex.find({ type: "speech" })).toHaveLength(0);
    specimen.expect(cortex.find({ type: "dialogue" })).toHaveLength(0);
  });

  specimen.it("rival providers of one type share the cortex", async () => {
    const services = [
      {
        service: makeService("anthropic", [
          { type: "dialogue", id: "dialogue-4", tune: [0.6, 0.6, 0.6, 0.6], via: { stream: async function* () {} } },
        ]),
        mask: { module: "anthropic", secrets: { anthropic: "k1" } },
      },
      {
        service: makeService("openai", [
          { type: "dialogue", id: "dialogue-5", tune: [0.3, 0.5, 0.5, 0.1], via: { stream: async function* () {} } },
        ]),
        mask: { module: "openai", secrets: { openai: "k2" } },
      },
    ];

    const cortex = new Cortex();
    for (const { service, mask } of services) {
      cortex.register(await service.provider(mask));
    }

    const eager = cortex.findOne({ type: "dialogue", tier: "eager" });
    specimen.expect(eager.secret).toBe("k2");

    const academic = cortex.findOne({ type: "dialogue", tier: "capable" });
    specimen.expect(academic.secret).toBe("k1");
  });
});
