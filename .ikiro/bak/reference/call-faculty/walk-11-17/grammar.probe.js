import { v } from "@vivalence/typology";
const { Packet, Part } = v.primitives.hallucination;
const PartDraft = v.object({ event: v.const("/part/draft"), index: v.integer(), text: v.string() });
const PartFull = v.object({ event: v.const("/part/full"), index: v.integer(), part: Part.Any, turn: v.string().optional() });
const TurnEager = v.object({ event: v.const("/turn/eager") });
const TurnResume = v.object({ event: v.const("/turn/resume") });
const Response = v.union([Packet.TurnOpen, TurnEager, TurnResume, Packet.PartOpen, Packet.PartDelta, PartDraft, PartFull, Packet.PartClose, Packet.TurnClose, Packet.ToolCall, Packet.ToolYield, Packet.TurnFull, Packet.ResponseClose]);
const quest = v.union([Packet.TurnOpen, TurnEager, TurnResume, Packet.PartOpen, Packet.PartDelta, PartDraft, PartFull, Packet.PartClose, Packet.TurnClose]);
const draft = { event: "/part/draft", index: 0, text: "vado al mer" };
const full = { event: "/part/full", index: 0, part: { type: "text", text: "Vado al mercato." }, turn: "0199f3a2-7c1e-7b40-9d2a-5e6f8a1b2c3d" };
const call = { event: "/tool/call", id: "t1", name: "/notes/create", input: { text: "x" } };
for (const packet of [draft, full, { event: "/turn/eager" }, call]) {
  console.log(JSON.stringify(packet, null, 2));
  console.log("  merged:", [...Response.errors(packet)].length ? "INVALID" : "valid", "· quest list:", [...quest.errors(packet)].length ? "INVALID" : "valid");
}
