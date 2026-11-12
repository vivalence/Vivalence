import { v } from "@vivalence/typology";
const Packet = v.primitives.hallucination.Packet;
export function* scribe(data) {
  switch (data.message_type) {
    case "session_started":
      yield { event: "/turn/open", turn: { role: "user" } };
      yield { event: "/part/open", index: 0, part: { type: "text", text: "" } };
      return;
    case "partial_transcript":
      yield { event: "/part/draft", index: 0, text: data.text };
      return;
    case "committed_transcript":
      yield { event: "/part/delta", index: 0, delta: { text: data.text } };
      return;
  }
}
const faculty = {
  type: "verbatim",
  id: "scribe_v3_live",
  tune: [0.5, 0.9, 0.6],
  context: 0,
  channels: { in: [{ type: "audio", codec: "pcm_16000" }], out: [{ type: "event" }] },
  via: { stream: async function* () {} },
  provider: "elevenlabs",
};
console.log(JSON.stringify(faculty, null, 2));
for (const data of [
  { message_type: "session_started", session_id: "s1", config: { sample_rate: 16000, model_id: "scribe_v3_live" } },
  { message_type: "partial_transcript", text: "vado al mer" },
  { message_type: "committed_transcript", text: "vado al mercato" },
]) {
  console.log("IN ", JSON.stringify(data));
  for (const packet of scribe(data)) {
    const schema = { "/turn/open": Packet.TurnOpen, "/part/open": Packet.PartOpen, "/part/delta": Packet.PartDelta }[packet.event];
    const verdict = schema ? ([...schema.errors(packet)].length ? "INVALID" : "valid") : "no schema in tree";
    console.log("OUT", JSON.stringify(packet), "·", verdict);
  }
}
