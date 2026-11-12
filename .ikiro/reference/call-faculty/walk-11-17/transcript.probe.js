import { pour } from "./pour2.probe.js";
const packets = [
  { event: "/turn/open", turn: { role: "user" } },
  { event: "/part/open", index: 0, part: { type: "text", text: "" } },
  { event: "/part/delta", index: 0, part: { text: "vado al " } },
  { event: "/part/draft", index: 0, part: { text: "mer" } },
  { event: "/part/delta", index: 0, part: { text: "mercato " } },
  { event: "/part/close", index: 0 },
  { event: "/turn/close" },
];
let turn = null;
for (const packet of packets) turn = pour(turn, packet);
console.log(JSON.stringify(turn, null, 2));
console.log(JSON.stringify(turn.parts[0].text));
