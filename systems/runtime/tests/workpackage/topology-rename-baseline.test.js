import { specimen } from "@vivalence/typology";
import paladin from "@vivalence/paladin";

await paladin.ikiro;
await paladin.vip.mount(paladin.scope.registry.branch("kernels"));

specimen.describe(
  "topology-to-corpus rename — paladin resolution (post-M1)",
  { sanitizeOps: false, sanitizeResources: false },
  () => {
    specimen.it("paladin resolves @vivalence/corpus/english-to-brazilian", async () => {
      const resolved = await paladin.vip.accio("@vivalence/corpus/english-to-brazilian");
      specimen.expect(resolved).toBeTruthy();
      specimen.expect(resolved.manifest).toBeTruthy();
      specimen.expect(resolved.manifest.type).toBe("corpus");
      specimen.expect(resolved.manifest.slug).toBe("english-to-brazilian");
    });

    specimen.it("vocalized variant also resolves with type 'corpus'", async () => {
      const resolved = await paladin.vip.accio("@vivalence/corpus/english-to-brazilian:vocalized");
      specimen.expect(resolved).toBeTruthy();
      specimen.expect(resolved.manifest.type).toBe("corpus");
    });

    specimen.it("corpus kernel exposes dataset", async () => {
      const resolved = await paladin.vip.accio("@vivalence/corpus/english-to-brazilian");
      specimen.expect(resolved.dataset).toBeTruthy();
    });

    specimen.it("daemon circuitry kernel array resolves all entries", async () => {
      const queries = [
        "@vivalence/domain/language-learning",
        "@vivalence/ontology/word",
        "@vivalence/ontology/sentence",
        "@vivalence/ontology/conjugation",
        "@vivalence/corpus/english-to-brazilian",
      ];

      const resolved = await Promise.all(queries.map((q) => paladin.vip.accio(q)));
      specimen.expect(resolved.every((r) => r?.manifest)).toBe(true);

      const types = resolved.map((r) => r.manifest.type);
      specimen.expect(types).toEqual(["domain", "ontology", "ontology", "ontology", "corpus"]);
    });

    specimen.it("kernel.js declares Corpus class with type 'corpus'", async () => {
      const kernel = await import("../../daemon/kernel.js");
      const corpusMode = kernel.modes.find((m) => m.type === "corpus");
      specimen.expect(corpusMode).toBeTruthy();
      specimen.expect(corpusMode.prototype.name).toBe("Corpus");
    });

    specimen.it("no @vivalence/topology entry resolves anymore", async () => {
      let threw = false;
      try {
        await paladin.vip.accio("@vivalence/topology/english-to-brazilian");
      } catch (_) {
        threw = true;
      }
      specimen.expect(threw).toBe(true);
    });
  },
);
