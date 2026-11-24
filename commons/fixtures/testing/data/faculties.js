export function textStream(text, role = "assistant") {
  return async function* () {
    yield { event: "/turn/open", turn: { role } };
    yield { event: "/part/open", index: 0, part: { type: "text", text: "" } };
    for (const character of text) {
      yield { event: "/part/delta", index: 0, part: { text: character } };
    }
    yield { event: "/part/close", index: 0 };
    yield {
      event: "/turn/close",
      turn: { meta: { usage: [
          { name: "input", unit: "tokens", amount: 10 },
          { name: "output", unit: "tokens", amount: text.length },
        ], state: "complete" } },
    };
  };
}

export function textTurn(text, state = "complete") {
  return {
    role: "assistant",
    parts: [{ type: "text", text }],
    meta: { usage: [
          { name: "input", unit: "tokens", amount: 10 },
          { name: "output", unit: "tokens", amount: text.length },
        ], state },
  };
}

export function toolUseTurn(id, name, input) {
  return {
    role: "assistant",
    parts: [
      { type: "text", text: `thinking about ${name}...` },
      { type: "tool_use", id, name, input },
    ],
    meta: { usage: [
          { name: "input", unit: "tokens", amount: 10 },
          { name: "output", unit: "tokens", amount: 20 },
        ], state: "tools" },
  };
}

export function toolUseStream(id, name, input) {
  const thinkingText = `thinking about ${name}...`;
  return async function* () {
    yield { event: "/turn/open", turn: { role: "assistant" } };
    yield { event: "/part/open", index: 0, part: { type: "text", text: "" } };
    for (const character of thinkingText) {
      yield { event: "/part/delta", index: 0, part: { text: character } };
    }
    yield { event: "/part/close", index: 0 };
    yield {
      event: "/part/open",
      index: 1,
      part: { type: "tool_use", id: "", name: "", input: {} },
    };
    yield {
      event: "/part/delta",
      index: 1,
      part: { id, name, input },
    };
    yield { event: "/part/close", index: 1 };
    yield {
      event: "/turn/close",
      turn: { meta: { usage: [
          { name: "input", unit: "tokens", amount: 10 },
          { name: "output", unit: "tokens", amount: 20 },
        ], state: "tools" } },
    };
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

const spread = (names, favoured) => names.map((_, index) => (index === favoured ? 0.9 : 0.1 / (names.length - 1)));

export function decided(question) {
  if (question.options) {
    const names = Object.keys(question.options);
    return Object.fromEntries(names.map((name, index) => [name, spread(names, 0)[index]]));
  }
  if (question.levels) return spread(question.levels, 1);
  return 0.9;
}

export function hasToolResult(turns) {
  return turns.at(-1)?.parts?.some((part) => part.type === "tool_result");
}

export function faculties() {
  return [
    {
      type: "dialogue",
      id: "opus",
      tune: [0.9, 0.3, 0.5],
      context: 200000,
      channels: {
        stream: {
          in: [
            { type: "text" },
            { type: "image" },
            { type: "document" },
            { type: "tool_result" },
            { type: "thinking" },
            { type: "tool_use" },
          ],
          out: [{ type: "text" }, { type: "thinking" }, { type: "tool_use" }],
          via: async ({ turns, tools }) => {
            const text = lastUserText(turns);
            const lookup = tools?.find((tool) => tool.name === "lookup");
            if (lookup && !hasToolResult(turns)) {
              return toolUseStream("t1", lookup.name, { query: text })();
            }
            return textStream(`[opus] ${text}`)();
          },
        },
        render: {
          in: [
            { type: "text" },
            { type: "image" },
            { type: "document" },
            { type: "tool_result" },
            { type: "thinking" },
            { type: "tool_use" },
          ],
          out: [{ type: "text" }, { type: "thinking" }, { type: "tool_use" }, { type: "object" }],
          via: async (request) => {
            const { turns, tools, output } = request;
            const text = lastUserText(turns);
            if (output?.schema) {
              const data = { query: text };
              return {
                role: "assistant",
                parts: [{ type: "object", data }],
                meta: { state: "complete" },
              };
            }
            const lookup = tools?.find((tool) => tool.name === "lookup");
            if (lookup && !hasToolResult(turns)) {
              return toolUseTurn("t1", lookup.name, { query: text });
            }
            return textTurn(`[opus] ${text}`);
          },
        },
      },
    },
    {
      type: "dialogue",
      id: "sonnet",
      tune: [0.4, 0.6, 0.5],
      context: 200000,
      channels: {
        stream: {
          in: [
            { type: "text" },
            { type: "image" },
            { type: "tool_result" },
            { type: "tool_use" },
          ],
          out: [{ type: "text" }, { type: "tool_use" }],
          via: async ({ turns }) =>
            textStream(`[sonnet] ${lastUserText(turns)}`)(),
        },
        render: {
          in: [
            { type: "text" },
            { type: "image" },
            { type: "tool_result" },
            { type: "tool_use" },
          ],
          out: [{ type: "text" }, { type: "tool_use" }],
          via: async ({ turns }) =>
            textTurn(`[sonnet] ${lastUserText(turns)}`),
        },
      },
    },
    {
      type: "dialogue",
      id: "haiku",
      tune: [0.1, 1.0, 0.5],
      context: 200000,
      channels: {
        render: {
          in: [{ type: "text" }, { type: "tool_result" }, { type: "tool_use" }],
          out: [{ type: "text" }],
          via: async ({ turns }) => textTurn(`[haiku] ${lastUserText(turns)}`),
        },
      },
    },
    {
      type: "choice",
      id: "chooser",
      tune: [0.4, 1.0, 0.9],
      context: 32000,
      options: 26,
      choices: null,
      channels: {
        render: {
          in: [{ type: "text" }, { type: "object" }],
          out: [{ type: "object" }],
          via: async ({ questions }) =>
            Object.fromEntries(
              Object.entries(questions).map(([key, question]) => [key, decided(question)]),
            ),
        },
      },
    },
  ];
}

export function verbatimFaculty(overrides = {}) {
  return {
    type: "verbatim",
    id: "scripted-verbatim",
    tune: [0.4, 0.5, 0.1],
    context: 0,
    channels: {
      stream: {
        in: [{ type: "audio", mime: ["audio/pcm;rate=16000;channels=1"] }],
        out: [{ type: "text" }],
        via: async function* ({ source }) {
          const heard = [];
          yield { event: "/turn/open", turn: { role: "user" } };
          yield { event: "/part/open", index: 0, part: { type: "text", text: "" } };
          for await (const packet of source) {
            heard.push(packet.audio.data);
            yield {
              event: "/part/draft",
              index: 0,
              part: { text: heard.join(" ").trim() },
            };
          }
          yield {
            event: "/part/delta",
            index: 0,
            part: { text: heard.join(" ").trim() },
          };
          yield { event: "/part/close", index: 0 };
          yield { event: "/turn/close", turn: {} };
        },
      },
    },
    ...overrides,
  };
}

export function speechFaculty(overrides = {}) {
  return {
    type: "speech",
    id: "scripted-speech",
    tune: [0.3, 0.5, 0.1],
    context: 0,
    channels: {
      stream: {
        in: [{ type: "text" }],
        out: [{ type: "audio", mime: ["audio/pcm;rate=16000;channels=1"] }],
        via: async function* ({ source }) {
          for await (const chunk of source) {
            yield {
              event: "/audio/packet",
              audio: { data: "audio:" + chunk, mime: "audio/pcm" },
            };
          }
          yield { event: "/audio/close", audio: { meta: { state: "complete" } } };
        },
      },
    },
    ...overrides,
  };
}
