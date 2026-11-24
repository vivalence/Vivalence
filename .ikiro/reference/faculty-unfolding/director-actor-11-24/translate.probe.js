import { translateTurns } from "/Users/finn/vivalence/code/vivalence/commons/hallucinators/anthropic/provider/translate.js";
import { directing } from "/Users/finn/vivalence/code/vivalence/.ikiro/reference/faculty-unfolding/director-actor-11-24/conversing.js";
const record = [
  { role: "user", parts: [{ type: "text", text: "la ronda" }] },
  { role: "assistant", parts: [{ type: "text", text: "re: la ronda" }] },
  { role: "director", parts: [
    { type: "tool_use", id: "g1", name: "actor_goal", input: { text: "card 2" } },
    { type: "tool_result", id: "g1", content: "" } ] },
  { role: "user", parts: [{ type: "text", text: "la playa" }] },
];
console.log(JSON.stringify(translateTurns(directing(record))));
console.log(JSON.stringify(translateTurns(record)));
