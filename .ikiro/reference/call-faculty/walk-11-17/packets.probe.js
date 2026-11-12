import { Controller, Span, ToolCall, Vector, belt, v } from "@vivalence/typology";
import * as hallucinate from "/Users/finn/vivalence/code/vivalence/subsystems/typology/gestalten/belt/hallucinate.js";
import * as schematics from "/Users/finn/vivalence/code/vivalence/subsystems/typology/schematics/entities/turn.js";

const { Packet, Audio, Part, Turn } = v.primitives.hallucination;
const BY_EVENT = {
  "/turn/open": Packet.TurnOpen, "/part/open": Packet.PartOpen, "/part/delta": Packet.PartDelta, "/part/close": Packet.PartClose,
  "/turn/close": Packet.TurnClose, "/tool/call": Packet.ToolCall, "/tool/yield": Packet.ToolYield, "/turn/full": Packet.TurnFull,
  "/response/close": Packet.ResponseClose, "/audio/packet": Audio.Packet, "/audio/close": Audio.Close,
};
const verdict = (packet) => (BY_EVENT[packet.event] ? ([...BY_EVENT[packet.event].errors(packet)].length ? "INVALID" : "valid") : "quest");
const kinds = (value) =>
  Object.fromEntries(Object.entries(value).filter(([key]) => key !== "event" && key !== "type").map(([key, held]) => [key, held !== null && typeof held === "object" && !Array.isArray(held) ? "nested" : "flat"]));

const stored = Object.values(schematics).find((entry) => entry?.examples).examples[0];
const answered = { role: "assistant", parts: [{ type: "text", text: "Fatto." }], meta: { state: "complete", usage: { prompt_tokens: 6901, completion_tokens: 4 }, provider: { finish_reason: "stop", model: "openai/gpt-5.1" } } };
let round = 0;
const faculty = { type: "dialogue", id: "stub", via: { render: async () => [{ role: stored.role, parts: stored.parts, meta: stored.meta }, answered][round++] } };
const tools = new Vector().open({ nature: new ToolCall("provision").signal.pathname }, () => ({ condition: "NOMINAL", output: { message: "3 cards" } }));
const controller = new Controller({ stdout: new Span("probe") });
const seen = new Map();
for await (const packet of hallucinate.respond(faculty, "render", { turns: [] }, { controller, tools, rounds: 3, backoff: [] }))
  if (!seen.has(packet.event)) seen.set(packet.event, packet);

const born = [
  { event: "/audio/packet", audio: "/x//H/8f/x//H/8f/x//Hw==", rate: 16000, pts: 0 },
  { event: "/part/draft", index: 0, part: { text: "vado al mer" } },
  { event: "/part/full", index: 0, part: { type: "text", text: "Vado al mercato." }, turn: "0199f3a2-7c1e-7b40-9d2a-5e6f8a1b2c3d" },
  { event: "/turn/eager" },
  { event: "/turn/resume" },
  { event: "/audio/played", pts: 0.8 },
];
console.log("--- packets: each event once, as the belt's respond yields it (tree), then the quest's");
for (const packet of [...seen.values(), ...born]) console.log(JSON.stringify(packet), "·", verdict(packet), "·", JSON.stringify(kinds(packet)));
console.log("--- parts");
for (const part of [...stored.parts, { type: "tool_result", id: "call_Qr26", condition: "NOMINAL", output: { message: "3 cards" } }, { type: "text", text: "poi ", draft: { text: "torno a" } }, { type: "image", data: "iVBOR…", media: "image/png" }, { type: "object", data: { count: 3 } }])
  console.log(JSON.stringify(part), "·", [...Part.Any.errors(part)].length ? "INVALID" : "valid", "·", JSON.stringify(kinds(part)));
console.log("--- the stored turn (the entity's own example)");
console.log(JSON.stringify(stored, null, 2));
console.log(JSON.stringify(kinds(stored)));
