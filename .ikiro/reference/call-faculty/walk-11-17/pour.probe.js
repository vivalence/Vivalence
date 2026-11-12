import { pour } from "/Users/finn/vivalence/code/vivalence/subsystems/typology/gestalten/belt/soma.js";
let turn = null;
for (const packet of [
  { event: "/turn/open", turn: { role: "user" } },
  { event: "/part/open", index: 0, part: { type: "text", text: "" } },
  { event: "/part/delta", index: 0, delta: { text: "vado " } },
  { event: "/part/draft", index: 0, text: "al mer" },
  { event: "/part/full", index: 0, part: { type: "text", text: "Vado al mercato." } },
]) {
  turn = pour(turn, packet);
  console.log(packet.event.padEnd(12), JSON.stringify(turn));
}
