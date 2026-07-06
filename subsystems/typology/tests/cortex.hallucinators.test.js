import { specimen, Cortex } from "@vivalence/typology";

function makeService(slug, faculties) {
  return {
    manifest: { owner: "@vivalence", type: "hallucinator", slug },
    provider: async (mask) => faculties.map((f) => ({ ...f, secret: mask.secrets[slug] })),
  };
}

specimen.describe("cortex hallucinators array → unified registration", () => {
  specimen.it("loops { service, mask } and registers each provider's faculties", async () => {
    const services = [
      {
        service: makeService("anthropic", [
          { type: "dialogue", tune: [0.4, 0.6, 0.6, 0.6], via: { stream: async function* () {} } },
        ]),
        mask: { module: "@vivalence/hallucinator/anthropic", secrets: { anthropic: "key-a" } },
      },
      {
        service: makeService("elevenlabs", [
          { type: "speech", tune: [0.3, 0.5, 0.5, 0.1], via: { stream: async function* () {} } },
        ]),
        mask: { module: "@vivalence/hallucinator/elevenlabs", secrets: { elevenlabs: "key-e" } },
      },
      {
        service: makeService("deepgram", [
          { type: "verbatim", tune: [0.4, 0.6, 0.5, 0.1], via: { stream: async function* () {} } },
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

    const speech = cortex.findOne({ type: "speech", tune: "eager" });
    specimen.expect(speech.type).toBe("speech");
    specimen.expect(speech.secret).toBe("key-e");

    const verbatim = cortex.findOne({ type: "verbatim", tune: "eager" });
    specimen.expect(verbatim.type).toBe("verbatim");
    specimen.expect(verbatim.secret).toBe("key-d");
  });

  specimen.it("empty hallucinators array → cortex has no faculties", async () => {
    const cortex = new Cortex();
    for (const { service, mask } of []) {
      cortex.register(await service.provider(mask));
    }
    specimen.expect(cortex.find({ type: "speech" })).toHaveLength(0);
    specimen.expect(cortex.find({ type: "dialogue" })).toHaveLength(0);
  });

  specimen.it("multiple services emitting same faculty type all land in cortex", async () => {
    const services = [
      {
        service: makeService("anthropic", [
          { type: "dialogue", tune: [0.6, 0.6, 0.6, 0.6], via: { stream: async function* () {} } },
        ]),
        mask: { module: "anthropic", secrets: { anthropic: "k1" } },
      },
      {
        service: makeService("openai", [
          { type: "dialogue", tune: [0.3, 0.5, 0.5, 0.1], via: { stream: async function* () {} } },
        ]),
        mask: { module: "openai", secrets: { openai: "k2" } },
      },
    ];

    const cortex = new Cortex();
    for (const { service, mask } of services) {
      cortex.register(await service.provider(mask));
    }

    const eager = cortex.findOne({ type: "dialogue", tune: "eager" });
    specimen.expect(eager.secret).toBe("k2");

    const academic = cortex.findOne({ type: "dialogue", tune: "capable" });
    specimen.expect(academic.secret).toBe("k1");
  });
});
