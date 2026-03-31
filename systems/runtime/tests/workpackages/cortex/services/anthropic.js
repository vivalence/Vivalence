// Mock Anthropic faculty provider
// Real contract shape: provider(service) → Faculty[]
// Three conversation tunes (opus/sonnet/haiku) + one object faculty.

function textStream(text, role = "assistant") {
  return async function* () {
    yield { event: "turn.open", turn: { role } };
    yield { event: "part.open", index: 0, part: { type: "text", text: "" } };
    for (const ch of text) {
      yield { event: "part.delta", index: 0, delta: { text: ch } };
    }
    yield { event: "part.close", index: 0 };
    yield { event: "turn.close", meta: { usage: { input: 10, output: text.length }, stop: "end_turn" } };
  };
}

function textTurn(text, stop = "end_turn") {
  return {
    role: "assistant",
    parts: [{ type: "text", text }],
    meta: { usage: { input: 10, output: text.length }, stop },
  };
}

function toolUseTurn(id, name, input) {
  return {
    role: "assistant",
    parts: [
      { type: "text", text: `thinking about ${name}...` },
      { type: "tool_use", id, name, input: JSON.stringify(input) },
    ],
    meta: { usage: { input: 10, output: 20 }, stop: "tool_use" },
  };
}

function lastUserText(turns) {
  const last = turns.findLast((t) => t.role === "user");
  return last?.parts?.find((p) => p.type === "text")?.text ?? "";
}

function hasToolResult(turns) {
  const last = turns.at(-1);
  return last?.parts?.some((p) => p.type === "tool_result");
}

export async function provider(service) {
  const tag = service?.tag ?? "anthropic";

  return [
    // opus — high quality, slow, expensive
    {
      type: "conversation",
      tune: [0.9, 1.0, 0.3],
      context: 200000,
      channels: {
        in: ["text", "image", "document", "tool_result", "thinking"],
        out: ["text", "thinking", "tool_use"],
      },
      via: {
        render: async (turns, ctx) => {
          const text = lastUserText(turns);
          // if tools provided and no tool_result yet, simulate tool_use
          if (ctx.tools && !hasToolResult(turns)) {
            return toolUseTurn("t1", "lookup", { query: text });
          }
          return textTurn(`[${tag}:opus] ${text}`);
        },
        stream: async (turns) => textStream(`[${tag}:opus] ${lastUserText(turns)}`)(),
      },
    },

    // sonnet — balanced
    {
      type: "conversation",
      tune: [0.3, 0.7, 0.8],
      context: 200000,
      channels: {
        in: ["text", "image", "tool_result"],
        out: ["text", "tool_use"],
      },
      via: {
        render: async (turns) => textTurn(`[${tag}:sonnet] ${lastUserText(turns)}`),
        stream: async (turns) => textStream(`[${tag}:sonnet] ${lastUserText(turns)}`)(),
      },
    },

    // haiku — fast, cheap, render only
    {
      type: "conversation",
      tune: [0.1, 0.3, 1.0],
      context: 200000,
      channels: {
        in: ["text", "tool_result"],
        out: ["text"],
      },
      via: {
        render: async (turns) => textTurn(`[${tag}:haiku] ${lastUserText(turns)}`),
      },
    },

    // object — structured output, render only
    {
      type: "object",
      tune: [0.3, 0.7, 0.8],
      context: 200000,
      channels: {
        in: ["text"],
        out: ["object"],
      },
      via: {
        render: async (turns, ctx) => ({
          role: "assistant",
          parts: [{ type: "object", data: { echo: lastUserText(turns) }, schema: ctx.schema }],
          meta: { usage: { input: 10, output: 5 }, stop: "end_turn" },
        }),
      },
    },
  ];
}
