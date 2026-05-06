import { specimen, Cortex } from "@vivalence/typology";

function makeService(slug, faculties) {
  return {
    manifest: { owner: "@vivalence", type: "hallucinator", slug },
    provider: async (mask) => faculties.map((f) => ({ ...f, secret: mask.secrets[slug] })),
  };
}

specimen.describe("cortex hallucinators array → unified extension", () => {
  specimen.it("loops { service, mask } and extends cortex with each provider's faculties", async () => {
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
      cortex.extend(await service.provider(mask));
    }

    specimen.expect(cortex.has("dialogue")).toBe(true);
    specimen.expect(cortex.has("speech")).toBe(true);
    specimen.expect(cortex.has("verbatim")).toBe(true);

    const speech = cortex.resolve("speech", { tune: "eager" });
    specimen.expect(speech.type).toBe("speech");
    specimen.expect(speech.secret).toBe("key-e");

    const verbatim = cortex.resolve("verbatim", { tune: "eager" });
    specimen.expect(verbatim.type).toBe("verbatim");
    specimen.expect(verbatim.secret).toBe("key-d");
  });

  specimen.it("empty hallucinators array → cortex has no faculties", async () => {
    const cortex = new Cortex();
    for (const { service, mask } of []) {
      cortex.extend(await service.provider(mask));
    }
    specimen.expect(cortex.has("speech")).toBe(false);
    specimen.expect(cortex.has("dialogue")).toBe(false);
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
      cortex.extend(await service.provider(mask));
    }

    const eager = cortex.resolve("dialogue", { tune: "eager" });
    specimen.expect(eager.secret).toBe("k2");

    const academic = cortex.resolve("dialogue", { tune: "capable" });
    specimen.expect(academic.secret).toBe("k1");
  });
});
