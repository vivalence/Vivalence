import { specimen } from "@vivalence/typology";
import provider from "../provider/index.js";

specimen.describe("elevenlabs provider", () => {
  specimen.it("returns array of speech faculties without performing network calls", async () => {
    const faculties = await provider({ secrets: { key: "fake-key" } });

    specimen.expect(Array.isArray(faculties)).toBe(true);
    specimen.expect(faculties.length > 0).toBe(true);

    for (const faculty of faculties) {
      specimen.expect(faculty.type).toBe("speech");
      specimen.expect(typeof faculty.via.stream).toBe("function");
      specimen.expect(Array.isArray(faculty.tune)).toBe(true);
      specimen.expect(faculty.channels.out[0].codec).toBe("pcm_16000");
    }
  });

  specimen.it("each faculty has unique voice config", async () => {
    const faculties = await provider({ secrets: { key: "fake-key" } });
    const voiceIds = faculties.map((f) => f.config.voice);
    specimen.expect(new Set(voiceIds).size).toBe(faculties.length);
  });
});
