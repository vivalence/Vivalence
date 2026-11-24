const turns = [
  { role: "assistant", parts: [{ type: "tool_use", id: "t1", name: "tool_load", input: { nature: "/modeB/search" } }] },
  {
    role: "user",
    parts: [{ type: "tool_result", id: "t1", condition: "NOMINAL", output: { loaded: "modeB_search", message: "modeB_search loaded" } }],
  },
];

const text = (part) => ({ type: "tool_result", tool_use_id: part.id, content: JSON.stringify(part.output) });
const reference = (part, tool_name) => ({
  type: "tool_result",
  tool_use_id: part.id,
  content: [{ type: "tool_reference", tool_name }],
});

const byName = (turns) => {
  const calls = new Map(turns.flatMap((turn) => turn.parts).filter((part) => part.type === "tool_use").map((part) => [part.id, part]));
  return (part) => (calls.get(part.id).name === "tool_load" ? reference(part, calls.get(part.id).input.nature.slice(1).replace("/", "_")) : text(part));
};
const byOutput = () => (part) => (part.output.loaded ? reference(part, part.output.loaded) : text(part));

for (const [label, translate] of [["by the call's name", byName(turns)], ["by the result's output", byOutput()]])
  console.log(`## ${label}\n${JSON.stringify(translate(turns[1].parts[0]), null, 2)}`);
