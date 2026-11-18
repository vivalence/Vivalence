const TOOL = "set_actor_conversation_context";
const said = (role, text) => ({ role, parts: [{ type: "text", text }] });
const set = (id, context) => [
  { role: "assistant", parts: [{ type: "tool_use", id, name: TOOL, input: { context } }] },
  { role: "user", parts: [{ type: "tool_result", id, content: "set" }] },
];

const record = [
  said("assistant", "How do you say 'bread'?"),
  said("user", "pan"),
  said("assistant", "¡Eso! Pan."),
  ...set("set_1", "Game: ronda. Next card: agua. Ask for 'water'."),
  said("user", "what now?"),
  said("assistant", "Next one: how do you say 'water'?"),
  said("user", "agua"),
  said("assistant", "Sí, agua."),
  ...set("set_2", "She dropped the article. Ask for it again with 'the': el agua."),
  said("user", "ok"),
];

const primer = { identity: "Francesca, a Spanish tutor.\n", "actor/voice": "One short sentence. Never read a list aloud.\n" };
const WINDOW = 4;
const calls = (turn) => turn.parts.filter((part) => part.type === "tool_use" && part.name === TOOL);
const spoken = (turn) => turn.parts.every((part) => part.type === "text");

const latest = record.flatMap(calls).at(-1).input.context;
const A = { system: { ...primer, director: latest }, turns: record.filter(spoken).slice(-WINDOW) };

const placed = record.flatMap((turn) => {
  if (spoken(turn)) return [turn];
  return calls(turn).map((call) => said("user", `[director] ${call.input.context}`));
});
const B = { system: primer, turns: placed.slice(-WINDOW) };

const restarted = JSON.parse(JSON.stringify(record));
console.log("A · the last call only", JSON.stringify(A, null, 2));
console.log("B · every call at its place", JSON.stringify(B, null, 2));
console.log("after a restart, A's word:", restarted.flatMap(calls).at(-1).input.context === latest);
console.log("B, the first direction still in view:", B.turns.some((turn) => turn.parts[0].text.includes("ronda")));
