import { similarity } from "/Users/finn/vivalence/code/vivalence/subsystems/typology/gestalten/belt/string.js";
import { pour } from "./pour2.probe.js";
const defaults = { window: 2, tolerance: 0.8, tail: 8 };
const bare = (word) => word.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
const agree = (a, b, t) => bare(a) === bare(b) || similarity(bare(a), bare(b)) >= t;
const tokens = (text) => (text ?? "").trim().split(/\s+/).filter(Boolean);
function frontier(ring, settled, tolerance) {
  const limit = Math.min(...ring.map((h) => h.length));
  let index = settled;
  while (index < limit && ring.every((h) => agree(h[index], ring.at(-1)[index], tolerance))) index += 1;
  return index;
}
async function* quest(packets, options = {}) {
  const { window, tolerance } = { ...defaults, ...options };
  let ring = [];
  let settled = 0;
  for await (const packet of packets) {
    if (packet.event !== "/part/draft") {
      if (packet.event === "/part/close") ring = [], settled = 0;
      yield packet;
      continue;
    }
    ring = [...ring, tokens(packet.part.text)].slice(-window);
    const reached = frontier(ring, settled, tolerance);
    if (reached > settled) yield { event: "/part/delta", index: packet.index, part: { text: ring.at(-1).slice(settled, reached).join(" ") + " " } };
    settled = reached;
    yield { event: "/part/draft", index: packet.index, part: { text: ring.at(-1).slice(settled).join(" ") } };
  }
}
async function* fixed(packets, options = {}) {
  const { window, tolerance, tail } = { ...defaults, ...options };
  let ring = [];
  let settled = 0;
  for await (const packet of packets) {
    switch (packet.event) {
      case "/part/draft": {
        const hypothesis = tokens(packet.part.text);
        ring = [...ring, hypothesis].slice(-window);
        const reached = ring.length === window ? frontier(ring, settled, tolerance) : settled;
        if (reached > settled) yield { event: "/part/delta", index: packet.index, part: { text: hypothesis.slice(settled, reached).join(" ") + " " } };
        settled = reached;
        yield { event: "/part/draft", index: packet.index, part: { text: hypothesis.slice(settled).slice(-tail).join(" ") } };
        break;
      }
      case "/part/delta": {
        const remainder = tokens(packet.part.text).slice(settled);
        if (remainder.length) yield { ...packet, part: { text: remainder.join(" ") + " " } };
        ring = [];
        settled = 0;
        break;
      }
      default:
        yield packet;
    }
  }
}
const stream = [
  { event: "/turn/open", turn: { role: "user" } },
  { event: "/part/open", index: 0, part: { type: "text", text: "" } },
  { event: "/part/draft", index: 0, part: { text: "vado" } },
  { event: "/part/draft", index: 0, part: { text: "vado al" } },
  { event: "/part/draft", index: 0, part: { text: "vado al mer" } },
  { event: "/part/delta", index: 0, part: { text: "vado al mercato" } },
  { event: "/part/draft", index: 0, part: { text: "e poi" } },
  { event: "/part/draft", index: 0, part: { text: "e poi compro" } },
  { event: "/part/delta", index: 0, part: { text: "e poi compro il pane" } },
  { event: "/part/close", index: 0 },
];
async function* source() { yield* stream; }
for (const [name, belt] of [["quest", quest], ["fixed", fixed]]) {
  let turn = null;
  console.log(`== ${name}`);
  for await (const packet of belt(source())) {
    turn = pour(turn, packet);
    if (packet.event.startsWith("/part/d")) console.log(" ", packet.event.padEnd(11), JSON.stringify(packet.part).padEnd(34), "→", JSON.stringify(turn.parts[0].text), turn.parts[0].draft ? JSON.stringify(turn.parts[0].draft.text) : "");
  }
  console.log("  sealed:", JSON.stringify(turn.parts[0]));
}
