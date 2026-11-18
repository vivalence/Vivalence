import { atom } from "nanostores";
import { ReplSignal, specimen, steer } from "@vivalence/typology";
import { Microphone } from "../../../subjects/app/prototypes/box/device/microphone/index.js";
import { dictate } from "../../../gestalten/commands/content/dictate.js";
import { mic } from "../../../gestalten/commands/content/mic.js";
import { polish } from "../../../gestalten/commands/content/polish.js";

const until = async (predicate, ms = 5000) => {
  const started = Date.now();
  while (!predicate()) {
    if (Date.now() - started > ms) throw new Error("timeout");
    await new Promise((wake) => setTimeout(wake, 5));
  }
};

const SPEAKING = `
const chunk = new Float32Array(160).fill(0.25);
while (true) {
  await Deno.stdout.write(new Uint8Array(chunk.buffer));
  await new Promise((wake) => setTimeout(wake, 5));
}`;

const HEARD = [
  [
    { event: "/turn/open", turn: { role: "user", id: "turn-1" } },
    { event: "/part/open", index: 0, part: { type: "text", text: "" } },
    { event: "/part/draft", index: 0, part: { text: "vado al" } },
  ],
  [
    { event: "/part/delta", index: 0, part: { text: "vado al " } },
    { event: "/part/draft", index: 0, part: { text: "mercato" } },
  ],
  [
    { event: "/part/delta", index: 0, part: { text: "mercato " } },
    { event: "/part/close", index: 0 },
    { event: "/turn/close", turn: {} },
  ],
  [
    { event: "/turn/open", turn: { role: "user", id: "turn-2" } },
    { event: "/part/open", index: 0, part: { type: "text", text: "" } },
    { event: "/part/draft", index: 0, part: { text: "poi torno" } },
  ],
  [
    { event: "/part/full", index: 0, part: { type: "text", text: "Vado al mercato." }, turn: "turn-1" },
    { event: "/part/delta", index: 0, part: { text: "poi " } },
    { event: "/part/draft", index: 0, part: { text: "torno a" } },
  ],
];
const TAIL = [
  { event: "/part/delta", index: 0, part: { text: "torno a casa " } },
  { event: "/part/close", index: 0 },
  { event: "/turn/close", turn: {} },
];

const world = (draft, { faulty = false, recorder = SPEAKING } = {}) => {
  const bridge = {
    $draft: atom(draft),
    $dictation: atom(null),
    $dictationFault: atom(null),
    get dictationFault() { return this.$dictationFault.get(); },
    get draft() { return this.$draft.get(); },
    get dictation() { return this.$dictation.get(); },
  };
  const requests = [];
  const frames = [];
  const sent = [];
  const microphone = new Microphone({ drivers: {} });
  microphone.recorder = { command: Deno.execPath(), args: ["eval", recorder] };
  const stream = async function* (source, options) {
    requests.push(options);
    let heard = 0;
    for await (const frame of source) {
      frames.push(frame);
      if (faulty && heard === 3) throw new Error("socket 1006");
      yield* HEARD[heard++] ?? [];
    }
    if (heard) yield* TAIL;
  };
  const terminal = {
    thread: { id: "thread-1" },
    mode: { harness: { verbatim: { stream } } },
    repl: { dispatch: async (typed) => void sent.push(typed) },
  };
  const client = { app: { bridge, box: { device: { microphone } } } };
  const run = (typed) => steer.dispatch.execute(dictate, { client, terminal }, new ReplSignal(typed));
  return { bridge, requests, frames, sent, microphone, run };
};

const dictation = async (draft, exit, { heard = HEARD.length, faulty } = {}) => {
  const held = world(draft, { faulty });
  const seen = [];
  held.bridge.$dictation.listen((value) => seen.push(structuredClone(value)));
  let fault = null;
  const dictating = held.run("/dictate").catch((error) => void (fault = error.message));
  await until(() => held.microphone.claimed);
  await until(() => held.frames.length >= Math.min(heard, faulty ? 4 : heard));
  if (exit) await held.run(exit);
  await dictating;
  return { ...held, seen, fault };
};

specimen.describe("/dictate — the microphone is the switch, one bridge store holds the words (Q11 · Q15 · Q23)", () => {
  specimen.it("stop: the spoken words append to dock.input, a sealed turn's polish in place", async () => {
    const { bridge, requests, microphone, seen } = await dictation("ciao", "/dictate/stop");
    specimen.expect(bridge.draft).toBe("ciao Vado al mercato. poi torno a casa");
    specimen.expect(bridge.$dictation.get()).toBe(null);
    specimen.expect(microphone.claimed).toBe(false);
    specimen.expect(requests).toEqual([{ input: { thread: "thread-1" } }]);
    const drafted = (held) => held !== null && held.open !== null && held.open.parts.some((part) => part.draft?.text === "mercato");
    specimen.expect(seen.some(drafted)).toBe(true);
  });

  specimen.it("the frames are audio packets of the one medium family, pts climbing", async () => {
    const { frames } = await dictation("", "/dictate/stop");
    specimen.expect(Object.keys(frames[0])).toEqual(["event", "pts", "audio"]);
    specimen.expect(frames[0].audio.rate).toBe(16000);
    specimen.expect(frames[1].pts).toBeGreaterThan(frames[0].pts);
  });

  specimen.it("send: the words join and the draft is sent as a turn, dock.input empty", async () => {
    const { bridge, sent } = await dictation("ciao", "/dictate/send");
    specimen.expect(sent).toEqual(["ciao Vado al mercato. poi torno a casa"]);
    specimen.expect(bridge.draft).toBe("");
  });

  specimen.it("trash: nothing joins", async () => {
    const { bridge, sent } = await dictation("ciao", "/dictate/trash");
    specimen.expect(bridge.draft).toBe("ciao");
    specimen.expect(sent).toEqual([]);
  });

  specimen.it("send before a word, on an empty draft: nothing is sent", async () => {
    const { bridge, sent } = await dictation("", "/dictate/send", { heard: 0 });
    specimen.expect(sent).toEqual([]);
    specimen.expect(bridge.draft).toBe("");
  });

  specimen.it("the route faults mid-stream: a stop, the words heard so far kept (Q16B); the fault stays on the bridge until trashed or the next dictation", async () => {
    const { bridge, fault, microphone, run } = await dictation("ciao", null, { faulty: true });
    specimen.expect(fault).toBe("socket 1006");
    specimen.expect(bridge.draft).toBe("ciao vado al mercato");
    specimen.expect(microphone.claimed).toBe(false);
    specimen.expect([bridge.dictation, bridge.dictationFault]).toEqual([null, { message: "socket 1006" }]);
    await run("/dictate/trash");
    specimen.expect(bridge.dictationFault).toBe(null);
  });

  specimen.it("a dictation that ends well leaves no fault", async () => {
    const { bridge } = await dictation("", "/dictate/stop");
    specimen.expect(bridge.dictationFault).toBe(null);
  });
});

specimen.describe("the tty microphone — a recorder spawned on the machine (Q17)", () => {
  specimen.it("a recorder that dies tears the microphone down and says why", async () => {
    const microphone = new Microphone({ drivers: {} });
    microphone.recorder = { command: Deno.execPath(), args: ["eval", "console.error('no input device'); Deno.exit(3)"] };
    await microphone.claim();
    await until(() => !microphone.claimed);
    specimen.expect(microphone.error).toContain("exited 3: no input device");
  });

  specimen.it("the recorder's chunks set the level: a steady 0.25 reads 0.25, and the release zeroes it", async () => {
    const microphone = new Microphone({ drivers: {} });
    microphone.recorder = { command: Deno.execPath(), args: ["eval", SPEAKING] };
    await microphone.claim();
    await until(() => microphone.level > 0);
    specimen.expect(microphone.level).toBeCloseTo(0.25, 5);
    microphone.release("stop");
    specimen.expect(microphone.level).toBe(0);
  });

  specimen.it("an absent recorder command rejects the claim", async () => {
    const microphone = new Microphone({ drivers: {} });
    microphone.recorder = { command: "viva-no-such-recorder", args: [] };
    await specimen.expect(microphone.claim()).rejects.toThrow();
    specimen.expect(microphone.claimed).toBe(false);
  });
});

specimen.describe("/mic · /polish — the box and the thread, each a repl line", () => {
  specimen.it("/mic mute: the recorder runs, nothing it hears is sent; /mic on: frames flow again", async () => {
    const microphone = new Microphone({ drivers: {} });
    microphone.recorder = { command: Deno.execPath(), args: ["eval", SPEAKING] };
    const client = { app: { box: { device: { microphone } } } };
    const run = (typed) => steer.dispatch.execute(mic, { client, signal: new ReplSignal(typed) }, new ReplSignal(typed));
    await microphone.claim();
    const frames = [];
    const reading = (async () => {
      for await (const frame of microphone.frames()) frames.push(frame);
    })();
    await until(() => frames.length > 0);
    specimen.expect(await run("/mic mute")).toEqual({ microphone: "mute" });
    await new Promise((wake) => setTimeout(wake, 30));
    const muted = frames.length;
    await new Promise((wake) => setTimeout(wake, 60));
    specimen.expect(frames.length).toBe(muted);
    await run("/mic on");
    await until(() => frames.length > muted);
    microphone.release("stop");
    await reading;
  });

  specimen.it("/polish engaged off writes CONVERSATIONAL.polish.engaged on the seated thread, its model kept", async () => {
    const writes = [];
    const thread = {
      id: "th1",
      traits: ["CONVERSATIONAL"],
      trait: { CONVERSATIONAL: { polish: { id: "google/gemini-3.5-flash-lite", engaged: true } } },
    };
    const client = { runtime: { entities: { thread: { updateOne: async (where, data) => void writes.push({ where, data }) } } } };
    const typed = new ReplSignal("/polish/engaged off");
    const answer = await steer.dispatch.execute(polish, { client, terminal: { thread }, signal: typed }, typed);
    specimen.expect(answer).toEqual({ CONVERSATIONAL: { polish: { engaged: false } } });
    specimen.expect(writes).toEqual([
      {
        where: { id: "th1" },
        data: {
          traits: ["CONVERSATIONAL"],
          trait: { CONVERSATIONAL: { polish: { id: "google/gemini-3.5-flash-lite", engaged: false } } },
        },
      },
    ]);
  });
});
