import { Controller, Cortex, soma, Span, specimen, ToolCall, v, Vector } from "@vivalence/typology";

const { Packet } = v.primitives.hallucination;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const turned = () => {
  let speaking = false;
  return function* (data) {
    switch (data.message_type) {
      case "partial_transcript":
        if (!speaking) {
          yield { event: "/turn/open", turn: { role: "user" } };
          yield { event: "/part/open", index: 0, part: { type: "text", text: "" } };
        }
        speaking = true;
        yield { event: "/part/draft", index: 0, part: { text: data.text } };
        return;
      case "committed_transcript":
        yield { event: "/part/delta", index: 0, part: { text: data.text } };
        yield { event: "/part/close", index: 0 };
        yield { event: "/turn/close", turn: {} };
        speaking = false;
        return;
    }
  };
};

const ear = (id = "scribe_v3_live") => ({
  type: "verbatim",
  id,
  provider: "elevenlabs",
  tune: [0.8, 0.9, 0.7],
  channels: { in: [{ type: "audio", codec: "pcm_16000" }], out: [{ type: "event" }] },
  via: {
    stream: async function* ({ source }, { signal }) {
      const scribe = turned();
      for await (const frame of source) {
        if (signal.aborted) return;
        yield* scribe(JSON.parse(atob(frame.audio.data)));
      }
    },
  },
});

const text = (...chunks) => async function* (signal) {
  yield { event: "/turn/open", turn: { role: "assistant" } };
  yield { event: "/part/open", index: 0, part: { type: "text", text: "" } };
  for (const chunk of chunks) {
    await sleep(15);
    if (signal.aborted) throw new DOMException("aborted", "AbortError");
    yield { event: "/part/delta", index: 0, part: { text: chunk } };
  }
  yield { event: "/part/close", index: 0 };
  yield { event: "/turn/close", turn: { meta: { state: "complete" } } };
};

const tool = async function* () {
  yield { event: "/turn/open", turn: { role: "assistant" } };
  yield { event: "/part/open", index: 0, part: { type: "tool_use", id: "call_1", name: "clock", input: {} } };
  yield { event: "/part/close", index: 0 };
  yield { event: "/turn/close", turn: { meta: { state: "tools" } } };
};

const mind = (id = "fake-mind", tune = [0.6, 0.4, 0.4]) => ({
  type: "dialogue",
  id,
  tune,
  channels: { in: [{ type: "text" }], out: [{ type: "event" }] },
  via: {
    stream: ({ turns }, { signal }) => {
      const last = turns.at(-1);
      if (last.parts[0].type === "tool_result") return text("Sono le ", "tre.")(signal);
      if (last.parts[0].text.includes("ore")) return tool();
      if (last.parts[0].text.includes("storia")) return text("C'era ", "una volta ", "un re ", "molto ", "stanco.")(signal);
      return text("Dimmi.")(signal);
    },
  },
});

const mouth = (id = "fake-mouth", tune = [0.5, 0.5, 0.1]) => ({
  type: "speech",
  id,
  tune,
  channels: { in: [{ type: "text" }], out: [{ type: "audio", codec: "pcm_16000" }] },
  via: {
    stream: async function* ({ source }, { signal }) {
      let pts = 0;
      for await (const chunk of source) {
        await sleep(25);
        if (signal.aborted) return;
        yield { event: "/audio/packet", pts, audio: { data: btoa(chunk), rate: 16000, codec: "pcm_16000" } };
        pts += 0.4;
      }
    },
  },
});

const frame = (data) => ({ event: "/audio/packet", audio: { data: btoa(JSON.stringify(data)), rate: 16000 } });
const said = (words) => [
  frame({ message_type: "partial_transcript", text: words.split(" ").slice(0, 2).join(" ") }),
  frame({ message_type: "committed_transcript", text: words }),
];

const call = async (script, hangup = 250) => {
  const controller = new Controller({ stdout: new Span("call") });
  const cortex = new Cortex().register([ear(), mind(), mouth()]);
  const tools = new Vector().open({ nature: new ToolCall("clock").signal.pathname }, () => ({ condition: "NOMINAL", product: { message: "15:00" } }));
  const microphone = (async function* () {
    for (const [wait, words] of script) {
      await sleep(wait);
      yield* said(words);
    }
    await sleep(hangup);
  })();
  const packets = [];
  let folded = null;
  for await (const packet of await cortex.hallucinate.call.stream({ controller, source: microphone, turns: [], tools })) {
    packets.push(packet);
    folded = soma.transcript(folded, packet);
  }
  return { packets, folded, controller };
};

specimen.describe("the cascaded call — ear · mind · mouth behind one stream (law 6 · Q0 · Q6)", () => {
  specimen.it("each organ is picked by its own selector; no ear, no call", () => {
    const cortex = new Cortex().register([ear(), mind("mind-a"), mind("mind-b", [0.9, 0.1, 0.1]), mouth("mouth-a"), mouth("mouth-b", [0.1, 0.9, 0.9])]);
    specimen.expect(() => cortex.findOne({ type: "call", via: "stream" })).toThrow(/2 'dialogue' faculties match/);
    const picked = cortex.findOne({ type: "call", via: "stream", mind: { id: "mind-b" }, speak: { tier: "fast" } });
    specimen.expect(picked.id).toBe("scribe_v3_live+mind-b+mouth-b");
    specimen.expect(new Cortex().register([mind(), mouth()]).findOne({ type: "call", via: "stream" })).toBe(undefined);
  });

  specimen.it("a heard turn seals, the mind answers aloud; every packet one grammar, every turn an id", async () => {
    const { packets, folded } = await call([[0, "ciao"]]);
    for (const packet of packets) specimen.expect([...Packet.Call.errors(packet)]).toEqual([]);
    specimen.expect(folded.turns.map((turn) => [turn.role, turn.parts[0].text])).toEqual([["user", "ciao"], ["assistant", "Dimmi."]]);
    specimen.expect(folded.turns.every((turn) => typeof turn.id === "string")).toBe(true);
    specimen.expect(packets.some((packet) => packet.event === "/audio/packet")).toBe(true);
  });

  specimen.it("a tool round speaks once as /turn/full, the mind answers on it (Q25)", async () => {
    const { packets, folded } = await call([[0, "che ore sono"]]);
    specimen.expect(packets.filter((packet) => packet.event === "/turn/full").map((packet) => packet.turn.parts)).toEqual([
      [{ type: "tool_result", id: "call_1", condition: "NOMINAL", product: { message: "15:00" } }],
    ]);
    specimen.expect(folded.turns.map((turn) => turn.role)).toEqual(["user", "assistant", "user", "assistant"]);
    specimen.expect(folded.turns.at(-1).parts[0].text).toBe("Sono le tre.");
  });

  specimen.it("spoken over, the reply closes interrupted and the next turn is heard (Q2 · Q6)", async () => {
    const { folded } = await call([[0, "raccontami una storia"], [70, "aspetta"]]);
    const [asked, story, interruption] = folded.turns;
    specimen.expect([asked.role, asked.parts[0].text]).toEqual(["user", "raccontami una storia"]);
    specimen.expect([story.role, story.meta.state]).toEqual(["assistant", "interrupted"]);
    specimen.expect(story.parts[0].text).not.toBe("C'era una volta un re molto stanco.");
    specimen.expect([interruption.role, interruption.parts[0].text]).toEqual(["user", "aspetta"]);
  });
});
