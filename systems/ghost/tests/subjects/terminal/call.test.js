import { atom } from "nanostores";
import { ReplSignal, specimen, steer } from "@vivalence/typology";
import { Microphone } from "../../../subjects/app/prototypes/box/device/microphone/index.js";
import { Speaker } from "../../../subjects/app/prototypes/box/device/speaker/index.js";
import { call } from "../../../gestalten/commands/content/call.js";

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
const LISTENING = "for await (const _ of Deno.stdin.readable) {}";
const tone = btoa(String.fromCharCode(...new Uint8Array(new Int16Array(1600).fill(1000).buffer)));

const ANSWERED = [
  { event: "/turn/open", turn: { role: "user", id: "u1" } },
  { event: "/part/open", index: 0, part: { type: "text", text: "" } },
  { event: "/part/draft", index: 0, part: { text: "racconta" } },
  { event: "/part/delta", index: 0, part: { text: "raccontami una storia" } },
  { event: "/part/close", index: 0 },
  { event: "/turn/close", turn: {} },
  { event: "/turn/open", turn: { role: "assistant", id: "a1" } },
  { event: "/part/open", index: 0, part: { type: "text", text: "" } },
  { event: "/part/delta", index: 0, part: { text: "C'era una volta" } },
  { event: "/audio/packet", pts: 0, audio: { data: tone, rate: 16000 } },
  { event: "/audio/packet", pts: 0.1, audio: { data: tone, rate: 16000 } },
  { event: "/part/close", index: 0 },
  { event: "/turn/close", turn: { meta: { state: "interrupted" } } },
  { event: "/part/full", index: 0, part: { type: "text", text: "Raccontami una storia." }, turn: "u1" },
];

const world = () => {
  const bridge = { $call: atom(null), get call() { return this.$call.get(); } };
  const merges = [];
  const states = [];
  const fed = [];
  const microphone = new Microphone({ drivers: {} });
  microphone.recorder = { command: Deno.execPath(), args: ["eval", SPEAKING] };
  const speaker = new Speaker({ drivers: {} });
  speaker.player = { command: Deno.execPath(), args: ["eval", LISTENING] };
  const stream = async function* (source, options) {
    fed.push(options);
    const reading = (async () => {
      for await (const packet of source) fed.push(packet.event);
    })();
    yield* ANSWERED;
    await reading;
  };
  const terminal = { thread: { id: "th1" }, mode: { id: "m1", harness: { call: { stream } } } };
  const client = {
    app: { bridge, box: { device: { microphone, speaker } } },
    runtime: { entities: { turn: { merge: async (turn) => void merges.push(structuredClone(turn)) } } },
  };
  bridge.$call.listen((held) => states.push(held === null ? null : held.state));
  const run = (typed) => steer.dispatch.execute(call, { client, terminal }, new ReplSignal(typed));
  return { bridge, merges, states, fed, microphone, speaker, run };
};

specimen.describe("/call — mic up, the reply aloud, captions as turns, spoken over it stops (milestone 7)", () => {
  specimen.it("a call: the voice states move, every touched turn merges, the sealed turn takes its polish, /call/end releases both devices", async () => {
    const { bridge, merges, states, fed, microphone, speaker, run } = world();
    const calling = run("/call");
    await until(() => merges.some((turn) => turn.id === "u1" && turn.parts.length > 0 && turn.parts[0].text === "Raccontami una storia."));
    specimen.expect([microphone.claimed, speaker.claimed]).toEqual([true, true]);
    for (const state of ["listening", "thinking", "speaking"]) specimen.expect(states).toContain(state);
    specimen.expect(merges.some((turn) => turn.id === "u1" && turn.parts.length > 0 && turn.parts[0].draft?.text === "racconta")).toBe(true);
    specimen.expect(merges.find((turn) => turn.id === "a1").thread).toBe("th1");
    specimen.expect(bridge.$call.get().heard).toHaveProperty("a1");
    await until(() => fed.includes("/audio/packet"));
    await run("/call/end");
    await calling;
    specimen.expect([microphone.claimed, speaker.claimed, bridge.$call.get()]).toEqual([false, false, null]);
    specimen.expect(fed[0]).toEqual({ input: { thread: "th1" } });
    specimen.expect(fed.slice(1).every((event) => event === "/audio/packet" || event === "/audio/played")).toBe(true);
  });
});
