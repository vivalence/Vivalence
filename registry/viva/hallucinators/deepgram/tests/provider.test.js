import { specimen } from "@vivalence/typology";
import provider, { nova, flux } from "../provider/index.js";

const events = (translate, data) => [...translate(data)];

specimen.describe("deepgram provider", () => {
  specimen.it("returns verbatim faculties without performing network calls", async () => {
    const faculties = await provider({ secrets: { key: "fake-key" } });
    specimen.expect(faculties.map((faculty) => faculty.config.model)).toEqual(["nova-3", "flux-general-multi"]);
    for (const faculty of faculties) {
      specimen.expect(faculty.type).toBe("verbatim");
      specimen.expect(typeof faculty.via.stream).toBe("function");
      specimen.expect(faculty.tune.length).toBe(4);
      specimen.expect(faculty.channels.in[0].codec).toBe("pcm_16000");
    }
    specimen.expect(faculties[0].config.language).toBe("multi");
  });

  specimen.it("nova results translate to verbatim packets; words ride the final", () => {
    specimen.expect(events(nova, { type: "SpeechStarted" })).toEqual([{ event: "/turn/open", turn: { role: "user" } }]);
    specimen.expect(events(nova, { type: "Results", is_final: false, channel: { alternatives: [{ transcript: "ciao a" }] } }))
      .toEqual([{ event: "/verbatim/partial", transcript: "ciao a" }]);
    specimen.expect(
      events(nova, {
        type: "Results",
        is_final: true,
        channel: { alternatives: [{ transcript: "ciao a tutti", words: [{ word: "ciao", start: 0, end: 0.3, confidence: 0.97, language: "it" }] }] },
      }),
    ).toEqual([
      { event: "/verbatim/final", transcript: "ciao a tutti", words: [{ word: "ciao", start: 0, end: 0.3, confidence: 0.97, language: "it" }] },
    ]);
    specimen.expect(events(nova, { type: "UtteranceEnd" })).toEqual([{ event: "/turn/close" }]);
    specimen.expect(events(nova, { type: "Metadata" })).toEqual([]);
    specimen.expect(events(nova, { type: "Results", channel: { alternatives: [{ transcript: "" }] } })).toEqual([]);
  });

  specimen.it("flux turn events translate to the same grammar plus eager/resume", () => {
    specimen.expect(events(flux, { event: "StartOfTurn", transcript: "so" })).toEqual([
      { event: "/turn/open", turn: { role: "user" } },
      { event: "/verbatim/partial", transcript: "so" },
    ]);
    specimen.expect(events(flux, { event: "Update", transcript: "so the" })).toEqual([{ event: "/verbatim/partial", transcript: "so the" }]);
    specimen.expect(events(flux, { event: "EagerEndOfTurn", transcript: "so the plan" })).toEqual([{ event: "/verbatim/eager", transcript: "so the plan" }]);
    specimen.expect(events(flux, { event: "TurnResumed" })).toEqual([{ event: "/verbatim/resume" }]);
    specimen.expect(events(flux, { event: "EndOfTurn", transcript: "so the plan is simple", words: [{ word: "so", confidence: 0.9 }] })).toEqual([
      { event: "/verbatim/final", transcript: "so the plan is simple", words: [{ word: "so", confidence: 0.9 }] },
      { event: "/turn/close" },
    ]);
  });
});
