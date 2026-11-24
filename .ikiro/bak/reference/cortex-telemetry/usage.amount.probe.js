import { amount, contexted } from "../../../systems/anima/src/skins/chrome/panels/sidebar/sections.js";

const measures = [
  { name: "input", unit: "tokens", amount: 60 },
  { name: "output", unit: "tokens", amount: 7 },
  { name: "cost", unit: "usd", amount: 0.002 },
];
console.log("input tokens", amount(measures, "input", "tokens"));
console.log("output tokens", amount(measures, "output", "tokens"));
console.log("cost usd", amount(measures, "cost", "usd"));
console.log("output chars", amount(measures, "output", "chars"));
const turns = [
  { role: "user", parts: [], meta: null },
  { role: "assistant", parts: [], meta: { state: "complete", usage: measures } },
];
console.log(JSON.stringify(contexted(turns, { context: 400000 })));
console.log(JSON.stringify(contexted(turns, undefined)));
console.log(JSON.stringify(contexted([], undefined)));

const told = (turn) =>
  turn.meta === null || turn.meta.usage === undefined ? "" : `${amount(turn.meta.usage, "input", "tokens")} / ${amount(turn.meta.usage, "output", "tokens")}`;
console.log(JSON.stringify(turns.map(told)));
console.log(JSON.stringify(told({ meta: { usage: [{ name: "cost", unit: "usd", amount: 0.04 }] } })));
