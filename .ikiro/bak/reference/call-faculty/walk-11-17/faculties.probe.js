import { v } from "@vivalence/typology";
import deepgram, { flux, nova } from "/Users/finn/vivalence/code/vivalence/commons/hallucinators/deepgram/provider/index.js";
import elevenlabs from "/Users/finn/vivalence/code/vivalence/commons/hallucinators/elevenlabs/provider/index.js";
import openrouter from "/Users/finn/vivalence/code/vivalence/commons/hallucinators/openrouter/provider/index.js";

const ROOT = "/Users/finn/vivalence/code/vivalence/";
const read = async (path) => JSON.parse(await Deno.readTextFile(ROOT + path));
const { Packet, Audio, Verbatim, Part } = v.primitives.hallucination;
const SCHEMAS = [Packet.Response, Audio.Packet, Verbatim.Any];
const valid = (packet) => (SCHEMAS.some((schema) => [...schema.errors(packet)].length === 0) ? "valid" : "INVALID");
const print = (title, held) => console.log(`=== ${title}\n${JSON.stringify(held, null, 2)}`);

print("dialogue · stream · anthropic", await read("commons/hallucinators/anthropic/tests/snapshots/translate-stream-events.snapshot.json"));
print("dialogue · stream · openrouter", await read("commons/hallucinators/openrouter/tests/snapshots/translate-stream-events.snapshot.json"));
print("dialogue · render · anthropic", await read("commons/hallucinators/anthropic/tests/snapshots/translate-response.snapshot.json"));
print("dialogue · render · openrouter", await read("commons/hallucinators/openrouter/tests/snapshots/translate-response.snapshot.json"));
print("dialogue · stream · the belt's loop", await read("subsystems/typology/tests/snapshots/hallucination-stream.snapshot.json"));
print("object · render · the belt", (await read("subsystems/typology/tests/snapshots/hallucination-object-schema.snapshot.json")).folded);

const NOVA = [
  { type: "SpeechStarted" },
  { type: "Results", is_final: false, channel: { alternatives: [{ transcript: "ciao a" }] } },
  { type: "Results", is_final: true, channel: { alternatives: [{ transcript: "ciao a tutti", words: [{ word: "ciao", start: 0, end: 0.3, confidence: 0.97, language: "it" }] }] } },
  { type: "UtteranceEnd" },
];
const FLUX = [
  { event: "StartOfTurn", transcript: "so" },
  { event: "Update", transcript: "so the" },
  { event: "EagerEndOfTurn", transcript: "so the plan" },
  { event: "TurnResumed" },
  { event: "EndOfTurn", transcript: "so the plan is simple", words: [{ word: "so", confidence: 0.9 }] },
];
print("verbatim · stream · deepgram nova-3", NOVA.flatMap((wire) => [...nova(wire)]));
print("verbatim · stream · deepgram flux", FLUX.flatMap((wire) => [...flux(wire)]));

const pcm = btoa(String.fromCharCode(...new Uint8Array(16)));
class Socket {
  static OPEN = 1;
  readyState = 1;
  listeners = { message: [], close: [] };
  constructor() { setTimeout(() => this.onopen()); }
  addEventListener(kind, run) { this.listeners[kind].push(run); }
  send(data) {
    if (!JSON.parse(data).flush) return;
    const emit = (body) => this.listeners.message.forEach((run) => run({ data: JSON.stringify(body) }));
    setTimeout(() => { emit({ audio: pcm }); emit({ audio: pcm }); emit({ isFinal: true }); });
  }
  close() { this.readyState = 3; }
}
const socket = globalThis.WebSocket;
globalThis.WebSocket = Socket;
const [voice] = await elevenlabs({ secrets: { key: "probe" } });
const spoken = [];
for await (const packet of voice.via.stream("buongiorno")) spoken.push(packet);
globalThis.WebSocket = socket;
print("speech · stream · elevenlabs", spoken);

const fetching = globalThis.fetch;
const answer = (body) => { globalThis.fetch = () => Promise.resolve(new Response(JSON.stringify(body), { status: 200 })); };
const faculties = await openrouter({ secrets: { key: "probe" } });
answer({ created: 1762700000, data: [{ b64_json: "iVBORw0KGgo", media_type: "image/png" }], usage: { prompt_tokens: 12, completion_tokens: 4160, total_tokens: 4172, cost: 0.04 } });
print("picture · render · openrouter", await faculties.find((held) => held.type === "picture").via.render({ prompt: "a red fox", images: [] }));
const round = {
  system: { expected: "Vado al mercato.", answer: "Io vado al mercato domani." },
  questions: {
    same: { type: "choice", ask: "Does `answer` mean `expected`?", options: { yes: null, partly: "extra or missing detail", no: null } },
    grade: { type: "score", ask: "How close is `answer` to `expected`?", levels: ["wrong", "close", "exact"] },
    ok: { type: "noul", ask: "Is `answer` grammatical Italian?" },
  },
};
answer({
  model: "typesafe/jev-1.13-20260917",
  answers: {
    same: { type: "choice", choice: "partly", probabilities: { partly: 0.96, no: 0.01, yes: 0.03 }, confidence: 0.93 },
    grade: { type: "score", score: 1.01, legend: { 0: "wrong", 1: "close", 2: "exact" }, probabilities: { 0: 0.01, 1: 0.97, 2: 0.02 }, confidence: 0.97 },
    ok: { type: "noul", noul: 0.97 },
  },
  usage: { input_tokens: 397, output_tokens: 70, cost: 1.6674e-05 },
});
print("choice · render · openrouter", await faculties.find((held) => held.type === "choice").via.render(round));
globalThis.fetch = fetching;

console.log("=== verdicts");
for (const [name, packets] of [["nova", NOVA.flatMap((wire) => [...nova(wire)])], ["flux", FLUX.flatMap((wire) => [...flux(wire)])], ["speech", spoken]])
  console.log(name, packets.map((packet) => `${packet.event} ${valid(packet)}`).join(" · "));
console.log("faculties offered:", JSON.stringify([...(await deepgram({ secrets: { key: "probe" } })), ...(await elevenlabs({ secrets: { key: "probe" } })).slice(0, 1), ...faculties].map((held) => `${held.type}:${Object.keys(held.via).join("+")}`).filter((held, index, all) => all.indexOf(held) === index)));
