import { specimen } from "@vivalence/typology";
import provider from "../provider/index.js";

specimen.describe("deepgram provider", () => {
  specimen.it("returns array of verbatim faculties without performing network calls", async () => {
    const faculties = await provider({ secrets: { key: "fake-key" } });

    specimen.expect(Array.isArray(faculties)).toBe(true);
    specimen.expect(faculties.length > 0).toBe(true);

    for (const faculty of faculties) {
      specimen.expect(faculty.type).toBe("verbatim");
      specimen.expect(typeof faculty.via.stream).toBe("function");
      specimen.expect(Array.isArray(faculty.tune)).toBe(true);
      specimen.expect(faculty.channels.in[0].codec).toBe("pcm_16000");
    }
  });

  specimen.it("offers profiles for both pt-BR and en", async () => {
    const faculties = await provider({ secrets: { key: "fake-key" } });
    const langs = faculties.map((f) => f.config.language);
    specimen.expect(langs).toContain("pt");
    specimen.expect(langs).toContain("en");
  });
});
