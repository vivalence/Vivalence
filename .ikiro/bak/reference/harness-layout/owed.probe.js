const turns = [
  { role: "user", parts: [{ type: "text", text: "find me three example sentences" }] },
  { role: "assistant", parts: [{ type: "tool_use", id: "t1", name: "load", input: { path: "/harvest" } }] },
  { role: "user", parts: [{ type: "tool_result", id: "t1", condition: "NOMINAL", output: { message: "/harvest loaded" } }] },
];
const ARMED = { "/harvest": "eager", "/research": "eager", "/shell": "lazy" };

const loaded = (turns) => {
  const parts = turns.flatMap((turn) => turn.parts);
  const settled = new Set(
    parts.filter((part) => part.type === "tool_result" && part.condition === "NOMINAL").map((part) => part.id),
  );
  return parts
    .filter((part) => part.type === "tool_use" && part.name === "load" && settled.has(part.id))
    .map((part) => part.input.path);
};
const owed = (ARMED, turns) =>
  Object.keys(ARMED).filter((path) => ARMED[path] === "eager" && !loaded(turns).includes(path));

console.log(JSON.stringify(owed(ARMED, turns)));
console.log(JSON.stringify(owed(ARMED, [])));
