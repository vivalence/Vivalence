import { Queue, sleep, soma, specimen, v } from "@vivalence/typology";
import provider from "../provider/index.js";

const { Audio, Packet } = v.primitives.hallucination;

const PCM = btoa(String.fromCharCode(...new Uint8Array(3200)));

const TWO = btoa("\x01\x02");

class SpeechSocket {
  static OPEN = 1;
  static instances = [];
  readyState = 1;
  sent = [];
  messages = [];
  listeners = { open: [], message: [], close: [], error: [] };
  constructor(url) {
    this.sent.push(url);
    SpeechSocket.instances.push(this);
    setTimeout(() => this.listeners.open.forEach((run) => run()));
  }
  addEventListener(kind, run) {
    this.listeners[kind].push(run);
  }
  send(data) {
    const message = JSON.parse(data);
    this.sent.push(message.text);
    this.messages.push(message);
    if (message.text !== "") return;
    const emit = (body) =>
      this.listeners.message.forEach((run) => run({ data: JSON.stringify(body) }));
    setTimeout(() => {
      emit({ audio: PCM });
      emit({ audio: PCM });
      if (message.flush) return this.close();
      emit({ isFinal: true });
    });
  }
  close() {
    this.readyState = 3;
    this.listeners.close.forEach((run) => run({ code: 1000 }));
  }
}

const REFUSED = {
  message: "Unusual activity has been detected on your account, so Free Tier access has been disabled.",
  error: "detected_unusual_activity",
  code: 1008,
};

class RefusedSocket extends SpeechSocket {
  send() {
    if (this.readyState !== 1) return;
    this.listeners.message.forEach((run) => run({ data: JSON.stringify(REFUSED) }));
    this.readyState = 3;
    this.listeners.close.forEach((run) => run({ code: 1008, reason: REFUSED.message }));
  }
}

class ScribeSocket {
  static OPEN = 1;
  static instances = [];
  readyState = 0;
  sent = [];
  listeners = new Map();
  constructor(url, options) {
    this.url = url;
    this.options = options;
    ScribeSocket.instances.push(this);
  }
  addEventListener(kind, handler) {
    this.listeners.set(kind, [...(this.listeners.get(kind) ?? []), handler]);
  }
  dispatch(kind, event = {}) {
    for (const handler of this.listeners.get(kind) ?? []) handler(event);
  }
  open() {
    this.readyState = ScribeSocket.OPEN;
    this.dispatch("open");
  }
  said(message) {
    this.dispatch("message", { data: JSON.stringify(message) });
  }
  send(payload) {
    this.sent.push(JSON.parse(payload));
  }
  close(code = 1000) {
    if (this.readyState === 3) return;
    this.readyState = 3;
    this.dispatch("close", { code, reason: "" });
  }
}

const FACULTIES = [
  { type: "speech", id: "luiza", model: "eleven_flash_v2_5", voice: "21m00Tcm4TlvDq8ikWAM", tune: [0.3, 0.4, 0.1] },
  { type: "speech", id: "leandro", model: "eleven_flash_v2_5", voice: "EXAVITQu4vr4xnSDxMaL", tune: [0.5, 0.5, 0.1] },
  { type: "verbatim", id: "scribe_v3_live", model: "scribe_v3_live", tune: [0.8, 0.9, 0.7] },
];

const faculty = async (type) =>
  (await provider({ secrets: { key: "fake-key" }, faculties: FACULTIES })).find((each) => each.type === type);

function listen(ear, source, settings = {}, abort = new AbortController()) {
  const collected = [];
  let fault = null;
  const done = (async () => {
    try {
      for await (const packet of ear.via.stream({ source, settings }, { signal: abort.signal })) {
        collected.push(packet);
      }
    } catch (error) {
      fault = error;
    }
  })();
  return { collected, fault: () => fault, done };
}

const OPENED = [
  { event: "/turn/open", turn: { role: "user" } },
  { event: "/part/open", index: 0, part: { type: "text", text: "" } },
];

const SEALED = [
  { event: "/part/close", index: 0 },
  { event: "/turn/close", turn: {} },
];

const valid = (packets) => {
  for (const packet of packets) specimen.expect([...Packet.Response.errors(packet)]).toEqual([]);
};

specimen.describe("elevenlabs provider", () => {
  specimen.it(
    "returns the speech faculties and the scribe ear without performing network calls",
    async () => {
      const faculties = await provider({ secrets: { key: "fake-key" }, faculties: FACULTIES });
      const speech = faculties.filter((each) => each.type === "speech");

      specimen.expect(faculties.map((each) => [each.type, each.id])).toEqual([
        ["speech", "luiza"],
        ["speech", "leandro"],
        ["verbatim", "scribe_v3_live"],
      ]);

      for (const voice of speech) {
        specimen.expect(typeof voice.via.stream).toBe("function");
        specimen.expect(typeof voice.via.render).toBe("function");
        specimen.expect(Array.isArray(voice.tune)).toBe(true);
        specimen.expect(voice.channels.out[0].codec).toBe("pcm_16000");
        specimen.expect(voice.channels.out[1].codec).toBe("mp3_44100_128");
      }

      const ear = faculties.find((each) => each.type === "verbatim");
      specimen.expect(ear.id).toBe("scribe_v3_live");
      specimen.expect(ear.tune).toEqual([0.8, 0.9, 0.7]);
      specimen.expect(ear.channels.in[0].codec).toBe("pcm_16000");
      specimen.expect(typeof ear.via.stream).toBe("function");
      specimen.expect(ear).matches(v.primitives.hallucination.Faculty);
    },
  );

  specimen.it("stream yields Audio.Packet from a plain string, pts by samples; a bare empty text ends the input (a flush keeps the socket open)", async () => {
    SpeechSocket.instances = [];
    const original = globalThis.WebSocket;
    globalThis.WebSocket = SpeechSocket;
    try {
      const voice = await faculty("speech");
      const packets = [];
      const signal = new AbortController().signal;
      for await (const packet of voice.via.stream({ source: "buongiorno" }, { signal })) {
        packets.push(packet);
      }

      specimen.expect(SpeechSocket.instances[0].sent[0]).toBe(
        "wss://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM/stream-input" +
          "?model_id=eleven_flash_v2_5&output_format=pcm_16000",
      );
      specimen.expect(SpeechSocket.instances[0].sent.slice(1)).toEqual([" ", "buongiorno", ""]);
      specimen.expect(SpeechSocket.instances[0].messages.at(-1)).toEqual({ text: "" });
      specimen.expect(packets.map((packet) => packet.event)).toEqual([
        "/audio/packet",
        "/audio/packet",
        "/audio/close",
      ]);
      specimen.expect(packets.map((packet) => packet.pts)).toEqual([0, 0.1, undefined]);
      for (const packet of packets) {
        specimen.expect(packet).matches(Audio.Any);
      }
    } finally {
      globalThis.WebSocket = original;
    }
  });

  specimen.it("an abort closes the speech socket before the flush, no audio follows", async () => {
    SpeechSocket.instances = [];
    const original = globalThis.WebSocket;
    globalThis.WebSocket = SpeechSocket;
    try {
      const voice = await faculty("speech");
      const text = new Queue();
      text.enqueue("uno");
      const abort = new AbortController();
      const packets = [];
      const flow = (async () => {
        for await (const packet of voice.via.stream({ source: text }, { signal: abort.signal })) {
          packets.push(packet);
        }
      })();
      await sleep.ms(5);
      abort.abort("SIGTERM");
      text.close();
      await flow;

      specimen.expect(SpeechSocket.instances[0].readyState).toBe(3);
      specimen.expect(SpeechSocket.instances[0].sent.slice(1)).toEqual([" ", "uno"]);
      specimen.expect(packets).toEqual([]);
    } finally {
      globalThis.WebSocket = original;
    }
  });

  specimen.it("a refused speech socket faults loudly, naming the refusal; no audio, never an empty stream", async () => {
    const original = globalThis.WebSocket;
    globalThis.WebSocket = RefusedSocket;
    try {
      const voice = await faculty("speech");
      const packets = [];
      let fault = null;
      try {
        for await (const packet of voice.via.stream({ source: "buongiorno" }, { signal: new AbortController().signal })) {
          packets.push(packet);
        }
      } catch (error) {
        fault = error.message;
      }
      specimen.expect([packets, fault]).toEqual([
        [],
        `[elevenlabs] speech detected_unusual_activity: ${REFUSED.message}`,
      ]);
    } finally {
      globalThis.WebSocket = original;
    }
  });

    specimen.it("each faculty has a unique id", async () => {
    const faculties = await provider({ secrets: { key: "fake-key" }, faculties: FACULTIES });
    const ids = faculties.map((each) => each.id);
    specimen.expect(new Set(ids).size).toBe(faculties.length);
  });

  specimen.it("only the row's faculties load: one entry yields one faculty; an unknown type faults naming it", async () => {
    const faculties = await provider({ secrets: { key: "fake-key" }, faculties: [FACULTIES[1]] });
    specimen.expect(faculties.map((each) => [each.type, each.id, each.tune])).toEqual([
      ["speech", "leandro", [0.5, 0.5, 0.1]],
    ]);
    const picture = { ...FACULTIES[0], type: "picture" };
    await specimen.expect(provider({ secrets: { key: "fake-key" }, faculties: [picture] })).rejects.toThrow(
      "[elevenlabs] faculties/0/type must be equal to constant",
    );
  });
});

specimen.describe("elevenlabs scribe — the ear speaks the one content grammar", () => {
  let original;

  specimen.beforeAll(() => {
    original = globalThis.WebSocket;
    globalThis.WebSocket = ScribeSocket;
  });

  specimen.afterAll(() => {
    globalThis.WebSocket = original;
  });

  specimen.it("dials the realtime endpoint, the key on the header", async () => {
    ScribeSocket.instances = [];
    const source = new Queue();
    const flow = listen(await faculty("verbatim"), source, { language: ["it"] });
    await sleep.ms(1);
    const ws = ScribeSocket.instances[0];
    const url = new URL(ws.url);

    specimen.expect(`${url.origin}${url.pathname}`)
      .toBe("wss://api.elevenlabs.io/v1/speech-to-text/realtime");
    specimen.expect(Object.fromEntries(url.searchParams)).toEqual({
      model_id: "scribe_v3_live",
      audio_format: "pcm_16000",
      commit_strategy: "turn_prediction",
      language_code: "it",
    });
    specimen.expect(ws.options).toEqual({ headers: { "xi-api-key": "fake-key" } });

    ws.open();
    source.close();
    await flow.done;
    specimen.expect(flow.fault()).toBe(null);
  });

  specimen.it("two or no languages leave the language to the model", async () => {
    ScribeSocket.instances = [];
    const ear = await faculty("verbatim");
    for (const settings of [{ language: ["it", "en"] }, {}]) {
      const source = new Queue();
      const flow = listen(ear, source, settings);
      await sleep.ms(1);
      const ws = ScribeSocket.instances.at(-1);
      specimen.expect(new URL(ws.url).searchParams.has("language_code")).toBe(false);
      ws.open();
      source.close();
      await flow.done;
    }
  });

  specimen.it("an Audio.Packet goes out as an input_audio_chunk, as it came", async () => {
    ScribeSocket.instances = [];
    const source = new Queue();
    const flow = listen(await faculty("verbatim"), source);
    await sleep.ms(1);
    const ws = ScribeSocket.instances[0];
    ws.open();
    source.enqueue({ event: "/audio/packet", pts: 0, audio: { data: PCM, rate: 16000 } });
    source.enqueue({ event: "/audio/packet", pts: 0.1, audio: { data: TWO, rate: 16000 } });
    await sleep.ms(1);

    specimen.expect(ws.sent).toEqual([
      { message_type: "input_audio_chunk", audio_base_64: PCM, commit: false, sample_rate: 16000 },
      { message_type: "input_audio_chunk", audio_base_64: TWO, commit: false, sample_rate: 16000 },
    ]);

    source.close();
    await flow.done;
    specimen.expect(flow.fault()).toBe(null);
  });

  specimen.it("a partial opens, drafts follow, a commit seals, a partial opens anew", async () => {
    ScribeSocket.instances = [];
    const source = new Queue();
    const flow = listen(await faculty("verbatim"), source);
    await sleep.ms(1);
    const ws = ScribeSocket.instances[0];
    ws.open();
    ws.said({ message_type: "session_started", session_id: "s1", config: {} });
    ws.said({ message_type: "partial_transcript", text: "ciao a" });
    await sleep.ms(1);
    specimen.expect(flow.collected).toEqual([
      ...OPENED,
      { event: "/part/draft", index: 0, part: { text: "ciao a" } },
    ]);

    ws.said({ message_type: "partial_transcript", text: "ciao a tutti" });
    await sleep.ms(1);
    specimen.expect(flow.collected.slice(3)).toEqual([
      { event: "/part/draft", index: 0, part: { text: "ciao a tutti" } },
    ]);

    ws.said({ message_type: "committed_transcript", text: "ciao a tutti" });
    await sleep.ms(1);
    specimen.expect(flow.collected.slice(4)).toEqual([
      { event: "/part/delta", index: 0, part: { text: "ciao a tutti" } },
      ...SEALED,
    ]);

    ws.said({ message_type: "partial_transcript", text: "come" });
    await sleep.ms(1);
    specimen.expect(flow.collected.slice(7)).toEqual([
      ...OPENED,
      { event: "/part/draft", index: 0, part: { text: "come" } },
    ]);

    ws.close(1000);
    source.close();
    await flow.done;
    specimen.expect(flow.fault()).toBe(null);
    valid(flow.collected);

    const folded = flow.collected.reduce((state, packet) => soma.transcript(state, packet), null);
    specimen.expect(folded.turns).toEqual([
      { role: "user", parts: [{ type: "text", text: "ciao a tutti" }] },
    ]);
    specimen.expect(folded.open).toEqual({
      role: "user",
      parts: [{ type: "text", text: "", draft: { text: "come" } }],
    });
  });

  specimen.it("an empty partial in silence opens nothing", async () => {
    ScribeSocket.instances = [];
    const source = new Queue();
    const flow = listen(await faculty("verbatim"), source);
    await sleep.ms(1);
    const ws = ScribeSocket.instances[0];
    ws.open();
    ws.said({ message_type: "partial_transcript", text: "" });
    ws.said({ message_type: "committed_transcript", text: "" });
    await sleep.ms(1);
    ws.close(1000);
    source.close();
    await flow.done;
    specimen.expect(flow.collected).toEqual([]);
  });

  specimen.it("a spent source mid-turn commits the tail, the seal closes the socket", async () => {
    ScribeSocket.instances = [];
    const source = new Queue();
    const flow = listen(await faculty("verbatim"), source);
    await sleep.ms(1);
    const ws = ScribeSocket.instances[0];
    ws.open();
    source.enqueue({ event: "/audio/packet", audio: { data: PCM, rate: 16000 } });
    ws.said({ message_type: "partial_transcript", text: "grazie" });
    await sleep.ms(1);
    source.close();
    await sleep.ms(1);

    specimen.expect(ws.sent.at(-1)).toEqual({
      message_type: "input_audio_chunk",
      audio_base_64: "",
      commit: true,
      sample_rate: 16000,
    });
    specimen.expect(ws.readyState).toBe(ScribeSocket.OPEN);

    ws.said({ message_type: "committed_transcript", text: "grazie mille" });
    await flow.done;
    specimen.expect(ws.readyState).toBe(3);
    specimen.expect(flow.collected).toEqual([
      ...OPENED,
      { event: "/part/draft", index: 0, part: { text: "grazie" } },
      { event: "/part/delta", index: 0, part: { text: "grazie mille" } },
      ...SEALED,
    ]);
    specimen.expect(flow.fault()).toBe(null);
    valid(flow.collected);
  });

  specimen.it("a tail too short to commit seals the turn empty: the refusal ends the stream, no fault, whatever the close code", async () => {
    ScribeSocket.instances = [];
    const source = new Queue();
    const flow = listen(await faculty("verbatim"), source);
    await sleep.ms(1);
    const ws = ScribeSocket.instances[0];
    ws.open();
    source.enqueue({ event: "/audio/packet", audio: { data: PCM, rate: 16000 } });
    ws.said({ message_type: "partial_transcript", text: "eh" });
    await sleep.ms(1);
    source.close();
    await sleep.ms(1);
    ws.said({
      message_type: "commit_throttled",
      error: "Session closed: only 0.13s of uncommitted audio. You need at least 0.3s of uncommitted audio before committing.",
    });
    await flow.done;
    specimen.expect(flow.collected).toEqual([...OPENED, { event: "/part/draft", index: 0, part: { text: "eh" } }, ...SEALED]);
    specimen.expect(flow.fault()).toBe(null);
    specimen.expect(ws.readyState).toBe(3);
    valid(flow.collected);
  });

  specimen.it("a commit refused while the source still speaks faults loudly", async () => {
    ScribeSocket.instances = [];
    const source = new Queue();
    const flow = listen(await faculty("verbatim"), source);
    await sleep.ms(1);
    const ws = ScribeSocket.instances[0];
    ws.open();
    ws.said({ message_type: "commit_throttled", error: "too soon" });
    await sleep.ms(1);
    source.close();
    await flow.done;
    specimen.expect(flow.fault().message).toBe("[elevenlabs] commit_throttled: too soon");
  });

  specimen.it("a spent source in silence closes the socket, no commit sent", async () => {
    ScribeSocket.instances = [];
    const source = new Queue();
    const flow = listen(await faculty("verbatim"), source);
    await sleep.ms(1);
    const ws = ScribeSocket.instances[0];
    ws.open();
    source.close();
    await flow.done;
    specimen.expect(ws.sent).toEqual([]);
    specimen.expect(ws.readyState).toBe(3);
    specimen.expect(flow.fault()).toBe(null);
  });

  specimen.it("an error message faults the stream loudly, naming its type", async () => {
    ScribeSocket.instances = [];
    const source = new Queue();
    const flow = listen(await faculty("verbatim"), source);
    await sleep.ms(1);
    const ws = ScribeSocket.instances[0];
    ws.open();
    ws.said({ message_type: "auth_error", error: "invalid api key" });
    await sleep.ms(1);
    source.close();
    await flow.done;
    specimen.expect(flow.fault().message).toBe("[elevenlabs] auth_error: invalid api key");
  });

  specimen.it("an abnormal close code names itself in the fault", async () => {
    ScribeSocket.instances = [];
    const source = new Queue();
    const flow = listen(await faculty("verbatim"), source);
    await sleep.ms(1);
    const ws = ScribeSocket.instances[0];
    ws.open();
    ws.close(1011);
    source.close();
    await flow.done;
    specimen.expect(flow.fault().message).toContain("1011");
  });

  specimen.it("an abort closes the socket and ends the stream without a fault", async () => {
    ScribeSocket.instances = [];
    const source = new Queue();
    const abort = new AbortController();
    const flow = listen(await faculty("verbatim"), source, {}, abort);
    await sleep.ms(1);
    const ws = ScribeSocket.instances[0];
    ws.open();
    ws.said({ message_type: "partial_transcript", text: "basta" });
    await sleep.ms(1);
    abort.abort("SIGTERM");
    source.close();
    await flow.done;
    specimen.expect(ws.readyState).toBe(3);
    specimen.expect(flow.collected).toEqual([
      ...OPENED,
      { event: "/part/draft", index: 0, part: { text: "basta" } },
    ]);
    specimen.expect(flow.fault()).toBe(null);
  });
});

specimen.describe("elevenlabs · a faculty carries its entry forward (m126 Q7A)", () => {
  specimen.it("tier · provider, stamped on the entry by paladin, reach the built faculty; type · id · via stay the builder's", async () => {
    const [entry] = FACULTIES;
    const [faculty] = await provider({ secrets: { key: "fake-key" }, faculties: [{ ...entry, tier: "tongue", provider: "elevenlabs" }] });
    specimen.expect([faculty.type, faculty.id, faculty.tier, faculty.provider]).toEqual([entry.type, entry.id, "tongue", "elevenlabs"]);
    specimen.expect(Object.keys(faculty.via).length).toBeGreaterThan(0);
    specimen.expect(entry.tier).toBeUndefined();
  });
});
