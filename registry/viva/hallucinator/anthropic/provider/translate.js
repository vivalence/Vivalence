// Bidirectional translation: vivalence turns/parts ↔ Anthropic messages API

// --- outbound: turns/parts → Anthropic format ---

export function translateTurns(turns) {
  const system = [];
  const messages = [];

  for (const turn of turns) {
    if (turn.role === "system") {
      for (const part of turn.parts) {
        system.push(partToAnthropic(part));
      }
      continue;
    }
    messages.push({
      role: turn.role,
      content: turn.parts.map(partToAnthropic),
    });
  }

  return { system, messages };
}

const STATES = {
  end_turn: "complete",
  stop_sequence: "complete",
  tool_use: "tools",
  max_tokens: "length",
  refusal: "filter",
};

function partToAnthropic(part) {
  switch (part.type) {
    case "alien":
      return part.block;
    case "text":
      return { type: "text", text: part.text };
    case "thinking":
      return { type: "thinking", thinking: part.text, signature: part.signature ?? "" };
    case "image":
      return {
        type: "image",
        source: { type: "base64", media_type: part.media, data: part.data },
      };
    case "document":
      return {
        type: "document",
        source: { type: "base64", media_type: part.media, data: part.data },
      };
    case "tool_use":
      return {
        type: "tool_use",
        id: part.id,
        name: part.name, //@beef move away from name on contract side. signature.
        input: part.input ?? {},
      };
    case "tool_result":
      return {
        type: "tool_result",
        tool_use_id: part.id,
        content: typeof part.output === "string" ? part.output : JSON.stringify(part.output),
      };
    default:
      return { type: "text", text: typeof part === "string" ? part : JSON.stringify(part) };
  }
}

// --- outbound: a Request → Anthropic messages.create params ---

export const RESPOND = {
  name: "respond",
  description: "Return the final result as structured data.",
};

export function buildParams(model, request, stream = false) {
  const { system, messages } = translateTurns(request.turns);
  const settings = request.settings ?? {};
  const marks = new Set(request.cache?.marks ?? []);
  const structured = request.output?.object;
  const tool_choice = structured ? { type: "any" } : settings.tool_choice;
  const params = {
    model: model.id,
    system,
    messages,
    max_tokens: settings.maxTokens ?? (model.thinking ? (stream ? 64000 : 16000) : 8192),
  };
  if (marks.has("context") && system.length) system.at(-1).cache_control = { type: "ephemeral" };
  if (stream) params.stream = true;
  if (model.thinking) {
    params.thinking = { type: "adaptive", display: "summarized" };
    if (settings.effort) params.output_config = { effort: settings.effort };
  }
  if (request.tools?.length) {
    params.tools = translateTools(request.tools);
    if (marks.has("tools")) params.tools.at(-1).cache_control = { type: "ephemeral" };
  }
  if (structured)
    params.tools = [
      ...(params.tools ?? []),
      { name: RESPOND.name, description: RESPOND.description, input_schema: structured },
    ];
  if (tool_choice) params.tool_choice = tool_choice;
  return params;
}

// --- outbound: tools → Anthropic tool definitions ---

export function translateTools(tools) {
  return tools.map((declaration) => ({
    name: declaration.name,
    description: declaration.valence ?? "",
    input_schema: declaration.input ?? { type: "object" },
  }));
}

export const fault = (error) => ({
  kind: error.status === 529 ? "overloaded" : error.status === 429 ? "throttled" : "request",
  retryable: [408, 429, 500, 529].includes(error.status),
  provider: { status: error.status, message: error.message },
});

// --- inbound: Anthropic response → turn ---

export function translateResponse(response) {
  return {
    role: response.role,
    parts: response.content.map(blockToPart),
    meta: {
      state: STATES[response.stop_reason] ?? "error",
      usage: response.usage,
      provider: { stop_reason: response.stop_reason, model: response.model },
    },
  };
}

function blockToPart(block) {
  switch (block.type) {
    case "text":
      return { type: "text", text: block.text };
    case "thinking":
      return { type: "thinking", text: block.thinking, signature: block.signature };
    case "tool_use":
      return {
        type: "tool_use",
        id: block.id,
        name: block.name,
        input: block.input ?? {},
      };
    default:
      return { type: "alien", dialect: "anthropic", block };
  }
}

// --- inbound: Anthropic stream events → packets ---

export function translateStreamEvent(event) {
  switch (event.type) {
    case "message_start":
      return { event: "/turn/open", turn: { role: event.message.role } };

    case "content_block_start": {
      const part = blockToPart(event.content_block);
      if (part.type === "tool_use") part.input = ""; // stream fills via input_json_delta
      return { event: "/part/open", index: event.index, part };
    }

    case "content_block_delta": {
      const delta = {};
      if (event.delta.type === "text_delta") delta.text = event.delta.text;
      else if (event.delta.type === "thinking_delta") delta.text = event.delta.thinking;
      else if (event.delta.type === "input_json_delta") delta.input = event.delta.partial_json;
      else if (event.delta.type === "signature_delta") delta.signature = event.delta.signature;
      return { event: "/part/delta", index: event.index, delta };
    }

    case "content_block_stop":
      return { event: "/part/close", index: event.index };

    case "message_delta":
      return {
        event: "/turn/close",
        meta: {
          state: STATES[event.delta.stop_reason] ?? "error",
          usage: event.usage,
          provider: { stop_reason: event.delta.stop_reason },
        },
      };

    case "message_stop":
      return null; // /turn/close already emitted on message_delta

    default:
      return null; // ping, etc — skip
  }
}
