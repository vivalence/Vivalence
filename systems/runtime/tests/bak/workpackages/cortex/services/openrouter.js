// Mock OpenRouter faculty provider
// Multi-provider gateway. Covers channels Anthropic doesn't: speech, audio, video.
// Real contract: provider(service) → Faculty[]

function textTurn(text, stop = "end_turn") {
  return {
    role: "assistant",
    parts: [{ type: "text", text }],
    meta: { usage: { input: 10, output: text.length }, stop },
  };
}

function textStream(text) {
  return async function* () {
    yield { event: "turn.open", turn: { role: "assistant" } };
    yield { event: "part.open", index: 0, part: { type: "text", text: "" } };
    for (const ch of text) {
      yield { event: "part.delta", index: 0, delta: { text: ch } };
    }
    yield { event: "part.close", index: 0 };
    yield { event: "turn.close", meta: { usage: { input: 10, output: text.length }, stop: "end_turn" } };
  };
}

function audioTurn(text) {
  // mock: audio data is just the text base64-encoded
  const data = btoa(text);
  return {
    role: "assistant",
    parts: [{ type: "audio", data, media: "audio/mp3" }],
    meta: { usage: { input: 10, output: text.length }, stop: "end_turn" },
  };
}

function audioStream(text) {
  const data = btoa(text);
  const chunkSize = 8;
  return async function* () {
    yield { event: "turn.open", turn: { role: "assistant" } };
    yield { event: "part.open", index: 0, part: { type: "audio", data: "", media: "audio/mp3" } };
    for (let i = 0; i < data.length; i += chunkSize) {
      yield { event: "part.delta", index: 0, delta: { data: data.slice(i, i + chunkSize) } };
    }
    yield { event: "part.close", index: 0 };
    yield { event: "turn.close", meta: { usage: { input: 10, output: text.length }, stop: "end_turn" } };
  };
}

function lastUserText(turns) {
  const last = turns.findLast((t) => t.role === "user");
  return last?.parts?.find((p) => p.type === "text")?.text ?? "";
}

export async function provider(service) {
  const tag = service?.tag ?? "openrouter";

  return [
    // conversation — mid-tier (llama/mixtral territory)
    {
      type: "conversation",
      tune: [0.2, 0.5, 0.9],
      context: 128000,
      channels: {
        in: ["text", "image", "tool_result"],
        out: ["text", "tool_use"],
      },
      via: {
        render: async (turns) => textTurn(`[${tag}:llama] ${lastUserText(turns)}`),
        stream: async (turns) => textStream(`[${tag}:llama] ${lastUserText(turns)}`)(),
      },
    },

    // conversation — high tier (gpt-4o territory)
    {
      type: "conversation",
      tune: [0.6, 0.9, 0.5],
      context: 128000,
      channels: {
        in: ["text", "image", "audio", "document", "tool_result"],
        out: ["text", "tool_use"],
      },
      via: {
        render: async (turns) => textTurn(`[${tag}:gpt4o] ${lastUserText(turns)}`),
        stream: async (turns) => textStream(`[${tag}:gpt4o] ${lastUserText(turns)}`)(),
      },
    },

    // speech — text to audio
    {
      type: "speech",
      tune: [0.3, 0.8, 0.7],
      context: 4096,
      channels: {
        in: ["text"],
        out: ["audio"],
      },
      via: {
        render: async (turns) => audioTurn(lastUserText(turns)),
        stream: async (turns) => audioStream(lastUserText(turns))(),
      },
    },

    // speech — cheap/fast TTS
    {
      type: "speech",
      tune: [0.1, 0.4, 1.0],
      context: 4096,
      channels: {
        in: ["text"],
        out: ["audio"],
      },
      via: {
        render: async (turns) => audioTurn(lastUserText(turns)),
      },
    },
  ];
}
