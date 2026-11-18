import { specimen, v } from "@vivalence/typology";
import provider, { flux, nova } from "../provider/index.js";

const { Packet } = v.primitives.hallucination;

const events = (translate, data) => [...translate(data)];

const valid = (packets) => {
  for (const packet of packets) specimen.expect([...Packet.Response.errors(packet)]).toEqual([]);
};

const FACULTIES = [
  { type: "verbatim", id: "nova-3", model: "nova-3", tune: [0.5, 0.9, 0.6] },
  { type: "verbatim", id: "flux-general-multi", model: "flux-general-multi", tune: [0.6, 0.8, 0.4] },
];

class DialedSocket {
  constructor(url) {
    throw new Error(url);
  }
}

specimen.describe("deepgram provider", () => {
  specimen.it(
    "returns verbatim faculties without performing network calls",
    async () => {
      const faculties = await provider({ secrets: { key: "fake-key" }, faculties: FACULTIES });
      specimen.expect(faculties.map((faculty) => faculty.id)).toEqual(
        ["nova-3", "flux-general-multi"],
      );
      for (const faculty of faculties) {
        specimen.expect(faculty.type).toBe("verbatim");
        specimen.expect(typeof faculty.via.stream).toBe("function");
        specimen.expect(faculty.tune.length).toBe(3);
        specimen.expect(faculty.channels.in[0].codec).toBe("pcm_16000");
      }
      specimen.expect(faculties[0].config.language).toEqual([]);
      specimen.expect(faculties[1].config.turns).toBe(true);
    },
  );

  specimen.it(
    "only the row's faculties load: one entry yields one faculty; an unknown type faults naming it",
    async () => {
      const faculties = await provider({ secrets: { key: "fake-key" }, faculties: [FACULTIES[1]] });
      specimen.expect(faculties.map((faculty) => [faculty.id, faculty.tune])).toEqual([
        ["flux-general-multi", [0.6, 0.8, 0.4]],
      ]);
      const original = globalThis.WebSocket;
      globalThis.WebSocket = DialedSocket;
      try {
        const dialed = faculties[0].via.stream({ source: [] }, { signal: new AbortController().signal });
        await specimen.expect(dialed.next()).rejects.toThrow(
          "wss://api.deepgram.com/v2/listen?model=flux-general-multi&",
        );
      } finally {
        globalThis.WebSocket = original;
      }
      const speech = { ...FACULTIES[0], type: "speech" };
      await specimen.expect(provider({ secrets: { key: "fake-key" }, faculties: [speech] })).rejects.toThrow(
        "[deepgram] faculties/0/type must be equal to constant",
      );
    },
  );

  specimen.it(
    "nova: an interim drafts, a final commits, the utterance seals",
    () => {
      const translate = nova();
      const heard = [
        ...events(translate, { type: "SpeechStarted" }),
        ...events(translate, {
          type: "Results",
          is_final: false,
          channel: { alternatives: [{ transcript: "ciao a" }] },
        }),
        ...events(translate, {
          type: "Results",
          is_final: true,
          channel: {
            alternatives: [{
              transcript: "ciao a tutti",
              words: [{ word: "ciao", start: 0, end: 0.3, confidence: 0.97, language: "it" }],
            }],
          },
        }),
        ...events(translate, { type: "UtteranceEnd" }),
      ];
      specimen.expect(heard).toEqual([
        { event: "/turn/open", turn: { role: "user" } },
        { event: "/part/open", index: 0, part: { type: "text", text: "" } },
        { event: "/part/draft", index: 0, part: { text: "ciao a" } },
        { event: "/part/delta", index: 0, part: { text: "ciao a tutti" } },
        { event: "/part/close", index: 0 },
        { event: "/turn/close", turn: {} },
      ]);
      valid(heard);
      specimen.expect(events(translate, { type: "Metadata" })).toEqual([]);
      specimen.expect(
        events(translate, {
          type: "Results",
          channel: { alternatives: [{ transcript: "" }] },
        }),
      ).toEqual([]);
      specimen.expect(events(translate, { type: "UtteranceEnd" })).toEqual([]);
    },
  );

  specimen.it(
    "nova opens on the first transcript when it beats SpeechStarted, and opens once",
    () => {
      const translate = nova();
      const heard = [
        ...events(translate, {
          type: "Results",
          is_final: false,
          channel: { alternatives: [{ transcript: "so" }] },
        }),
        ...events(translate, { type: "SpeechStarted" }),
        ...events(translate, {
          type: "Results",
          is_final: false,
          channel: { alternatives: [{ transcript: "so the" }] },
        }),
      ];
      specimen.expect(heard).toEqual([
        { event: "/turn/open", turn: { role: "user" } },
        { event: "/part/open", index: 0, part: { type: "text", text: "" } },
        { event: "/part/draft", index: 0, part: { text: "so" } },
        { event: "/part/draft", index: 0, part: { text: "so the" } },
      ]);
      valid(heard);
    },
  );

  specimen.it(
    "flux: the same grammar plus eager · resume, the end rewrites the part whole",
    () => {
      const heard = [
        ...events(flux, { event: "StartOfTurn", transcript: "so" }),
        ...events(flux, { event: "Update", transcript: "so the" }),
        ...events(flux, { event: "EagerEndOfTurn", transcript: "so the plan" }),
        ...events(flux, { event: "TurnResumed" }),
        ...events(flux, {
          event: "EndOfTurn",
          transcript: "so the plan is simple",
          words: [{ word: "so", confidence: 0.9 }],
        }),
      ];
      specimen.expect(heard).toEqual([
        { event: "/turn/open", turn: { role: "user" } },
        { event: "/part/open", index: 0, part: { type: "text", text: "" } },
        { event: "/part/draft", index: 0, part: { text: "so the" } },
        { event: "/turn/eager" },
        { event: "/turn/resume" },
        { event: "/part/full", index: 0, part: { type: "text", text: "so the plan is simple" } },
        { event: "/part/close", index: 0 },
        { event: "/turn/close", turn: {} },
      ]);
      valid(heard);
    },
  );
});

specimen.describe("deepgram · a faculty carries its entry forward (m126 Q7A)", () => {
  specimen.it("tier · provider, stamped on the entry by paladin, reach the built faculty; type · id · via stay the builder's", async () => {
    const [entry] = FACULTIES;
    const [faculty] = await provider({ secrets: { key: "fake-key" }, faculties: [{ ...entry, tier: "ear", provider: "deepgram" }] });
    specimen.expect([faculty.type, faculty.id, faculty.tier, faculty.provider]).toEqual([entry.type, entry.id, "ear", "deepgram"]);
    specimen.expect(Object.keys(faculty.via).length).toBeGreaterThan(0);
    specimen.expect(entry.tier).toBeUndefined();
  });
});
