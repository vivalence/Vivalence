import { shape, sleep, specimen, v } from "@vivalence/typology";
import { create } from "./scenarios/cortex.js";
import { speechFaculty } from "./scenarios/fixtures.js";

const { Packet } = v.primitives.hallucination;

const ear = {
  type: "verbatim",
  id: "utterance-ear",
  tune: [0.4, 0.5, 0.1],
  context: 0,
  channels: {
    stream: {
      in: [{ type: "audio", mime: ["audio/pcm;rate=16000;channels=1"] }],
      out: [{ type: "text" }],
      via: async function* ({ source }) {
        for await (const packet of source) {
          yield { event: "/turn/open", turn: { role: "user" } };
          yield { event: "/part/open", index: 0, part: { type: "text", text: "" } };
          yield { event: "/part/draft", index: 0, part: { text: packet.audio.data } };
          yield { event: "/part/delta", index: 0, part: { text: packet.audio.data } };
          yield { event: "/part/close", index: 0 };
          yield { event: "/turn/close", turn: {} };
        }
      },
    },
  },
};

async function* microphone(words, hangup = 400) {
  for (const word of words) yield { event: "/audio/packet", audio: { data: word, mime: "audio/pcm" } };
  await sleep.ms(hangup);
}

let scenario;

specimen.describe("call integration — /harness/call: heard turns and replies stored, audio never, a polish rewrites its sealed turn (milestone 6 · Q8)", () => {
  specimen.beforeAll(async () => {
    scenario = await create({ faculties: [ear, speechFaculty()] });
  });

  specimen.afterAll(async () => {
    await scenario.orm.close();
  });

  specimen.it("a spoken turn is answered aloud; every packet is the call's family", async () => {
    const thread = await scenario.createThread();
    const packets = [];
    for await (const packet of await scenario.dewey.harness.call.stream({ source: microphone(["ciao"]), thread: thread.id }))
      packets.push(packet);
    for (const packet of packets) specimen.expect([...Packet.Call.errors(packet)]).toEqual([]);
    const opened = packets.filter((packet) => packet.event === "/turn/open").map((packet) => packet.turn.role);
    specimen.expect(opened).toEqual(["user", "assistant"]);
    specimen.expect(packets.some((packet) => packet.event === "/audio/packet")).toBe(true);

    scenario.em.clear();
    const stored = await scenario.entities.turn.history({ thread: thread.id });
    specimen.expect(stored.map((turn) => turn.role)).toEqual(["user", "assistant"]);
    specimen.expect(stored[0].id).toBe(packets[0].turn.id);
    specimen.expect(stored.flatMap((turn) => turn.parts).every((part) => part.type === "text")).toBe(true);
    const polish = packets.find((packet) => packet.event === "/part/full");
    specimen.expect(polish.turn).toBe(stored[0].id);
    specimen.expect(stored[0].parts[0].text).toBe(polish.part.text);
  });

  specimen.it("no mouth in the cortex: no /call route", async () => {
    const mute = await create({ faculties: [ear] });
    specimen.expect(Object.keys(shape.strip(mute.dewey.aperture.branch("/harness")).branches)).not.toContain("call");
    specimen.expect(Object.keys(shape.strip(scenario.dewey.aperture.branch("/harness")).branches)).toContain("call");
    await mute.orm.close();
  });
});
