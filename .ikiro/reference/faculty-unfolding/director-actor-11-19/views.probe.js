import { Controller, Cortex, Span, ToolCall, Vector } from "@vivalence/typology";

const POINTS = {
  frugal: [0.1, 0.9, 1.0],
  fast: [0.4, 1.0, 0.8],
  balanced: [0.5, 0.5, 0.5],
  capable: [0.9, 0.2, 0.5],
  unleashed: [1.0, 0.9, 0.1],
};

const director = {
  type: "dialogue", id: "director-mind", tune: POINTS.capable,
  channels: { in: [{ type: "text" }], out: [{ type: "event" }] },
  via: {
    render: async ({ turns }) => {
      const last = turns.at(-1);
      if (last.parts[0].type === "tool_result")
        return { role: "assistant", parts: [{ type: "text", text: "Graded; ronda card 2 is dealt." }], meta: { state: "complete" } };
      return {
        role: "assistant",
        parts: [
          { type: "tool_use", id: "grade_1", name: "grade", input: { literal: "pan.noun", signal: "SUCCESS" } },
          { type: "tool_use", id: "deal_1", name: "deal", input: { count: 2 } },
        ],
        meta: { state: "tools" },
      };
    },
  },
};

const tools = new Vector()
  .open({ nature: new ToolCall("grade").signal.pathname }, () => ({ condition: "NOMINAL", product: { message: "pan.noun SUCCESS" } }))
  .open({ nature: new ToolCall("deal").signal.pathname }, () => ({ condition: "NOMINAL", product: { message: "now: agua · next: leche" } }));

const cortex = new Cortex(POINTS).register([director]);
const spoken = [
  { role: "assistant", parts: [{ type: "text", text: "How do you say 'bread'?" }] },
  { role: "user", parts: [{ type: "text", text: "pan" }] },
  { role: "assistant", parts: [{ type: "text", text: "¡Eso! Pan. Now say: I eat bread." }] },
];
const rendered = await cortex.hallucinate.dialogue.render({
  controller: new Controller({ stdout: new Span("director") }),
  system: { identity: "You are the director." },
  turns: spoken,
  tools,
  policy: { id: "director-mind", rounds: 3 },
});
const record = [...spoken, ...rendered.turns, { role: "user", parts: [{ type: "text", text: "como pan" }] }];

const brief = (turns) => turns.map((turn) => `${turn.role.padEnd(9)} ${turn.parts.map((part) => part.type === "text" ? JSON.stringify(part.text) : part.type).join(" · ")}`);
const UNSPOKEN = ["tool_use", "tool_result", "thinking"];
const voiced = (turns) =>
  turns
    .map((turn) => ({ ...turn, parts: turn.parts.filter((part) => !UNSPOKEN.includes(part.type)) }))
    .filter((turn) => turn.parts.length > 0);

console.log("the record, one thread\n" + brief(record).join("\n"));
console.log("\nthe actor's view, by part type\n" + brief(voiced(record)).join("\n"));
