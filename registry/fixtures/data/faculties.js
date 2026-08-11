export function textStream(text, role = "assistant") {
  return async function* () {
    yield { event: "/turn/open", turn: { role } };
    yield { event: "/part/open", index: 0, part: { type: "text", text: "" } };
    for (const character of text) {
      yield { event: "/part/delta", index: 0, delta: { text: character } };
    }
    yield { event: "/part/close", index: 0 };
    yield {
      event: "/turn/close",
      meta: { usage: { input: 10, output: text.length }, state: "complete" },
    };
  };
}

export function textTurn(text, state = "complete") {
  return {
    role: "assistant",
    parts: [{ type: "text", text }],
    meta: { usage: { input: 10, output: text.length }, state },
  };
}

export function toolUseTurn(id, name, input) {
  return {
    role: "assistant",
    parts: [
      { type: "text", text: `thinking about ${name}...` },
      { type: "tool_use", id, name, input },
    ],
    meta: { usage: { input: 10, output: 20 }, state: "tools" },
  };
}

export function toolUseStream(id, name, input) {
  const inputString = JSON.stringify(input);
  const thinkingText = `thinking about ${name}...`;
  return async function* () {
    yield { event: "/turn/open", turn: { role: "assistant" } };
    yield { event: "/part/open", index: 0, part: { type: "text", text: "" } };
    for (const character of thinkingText) {
      yield { event: "/part/delta", index: 0, delta: { text: character } };
    }
    yield { event: "/part/close", index: 0 };
    yield { event: "/part/open", index: 1, part: { type: "tool_use", id: "", name: "", input: "" } };
    yield { event: "/part/delta", index: 1, delta: { id, name, input: inputString } };
    yield { event: "/part/close", index: 1 };
    yield { event: "/turn/close", meta: { usage: { input: 10, output: 20 }, state: "tools" } };
  };
}

export function lastUserText(turns) {
  for (let index = turns.length - 1; index >= 0; index--) {
    if (turns[index].role !== "user") continue;
    const text = turns[index].parts?.find((part) => part.type === "text")?.text;
    if (text) return text;
  }
  return "";
}

export function hasToolResult(turns) {
  return turns.at(-1)?.parts?.some((part) => part.type === "tool_result");
}

export function faculties() {
  return [
    {
      type: "dialogue",
      tune: [0.9, 1.0, 0.3],
      context: 200000,
      channels: {
        in: ["text", "image", "document", "tool_result", "thinking"],
        out: ["text", "thinking", "tool_use"],
      },
      via: {
        render: async (request) => {
          const { turns, tools, output } = request;
          const text = lastUserText(turns);
          if (output?.schema) {
            const data = { query: text };
            return { role: "assistant", parts: [{ type: "object", data }], meta: { state: "complete" }, object: data };
          }
          const lookup = tools?.find((tool) => tool.name === "lookup");
          if (lookup && !hasToolResult(turns)) {
            return toolUseTurn("t1", lookup.name, { query: text });
          }
          return textTurn(`[opus] ${text}`);
        },
        stream: async ({ turns, tools }) => {
          const text = lastUserText(turns);
          const lookup = tools?.find((tool) => tool.name === "lookup");
          if (lookup && !hasToolResult(turns)) {
            return toolUseStream("t1", lookup.name, { query: text })();
          }
          return textStream(`[opus] ${text}`)();
        },
      },
    },
    {
      type: "dialogue",
      tune: [0.4, 0.6, 0.6],
      context: 200000,
      channels: { in: ["text", "image", "tool_result"], out: ["text", "tool_use"] },
      via: {
        render: async ({ turns }) => textTurn(`[sonnet] ${lastUserText(turns)}`),
        stream: async ({ turns }) => textStream(`[sonnet] ${lastUserText(turns)}`)(),
      },
    },
    {
      type: "dialogue",
      tune: [0.1, 0.3, 1.0],
      context: 200000,
      channels: { in: ["text", "tool_result"], out: ["text"] },
      via: {
        render: async ({ turns }) => textTurn(`[haiku] ${lastUserText(turns)}`),
      },
    },
  ];
}
