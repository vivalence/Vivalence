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

function partToAnthropic(part) {
  switch (part.type) {
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
        name: part.name,
        input: typeof part.input === "string" ? (part.input ? JSON.parse(part.input) : {}) : (part.input ?? {}),
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

export function buildParams(model, request, stream = false) {
  const { system, messages } = translateTurns(request.turns);
  const settings = request.settings ?? {};
  const params = {
    model: model.id,
    system,
    messages,
    max_tokens: settings.maxTokens ?? 8192,
  };
  if (stream) params.stream = true;
  if (model.thinking && !settings.tool_choice) {
    params.thinking = { type: "enabled", budget_tokens: settings.thinkingBudget ?? 16000 };
    params.max_tokens = settings.maxTokens ?? 32000;
  }
  if (request.tools) params.tools = translateTools(request.tools);
  if (settings.tool_choice) params.tool_choice = settings.tool_choice;
  return params;
}

// --- outbound: tools → Anthropic tool definitions ---

export function translateTools(tools) {
  return Object.entries(tools).map(([name, spec]) => {
    if (typeof spec === "function") {
      return { name, description: "", input_schema: { type: "object" } };
    }
    return {
      name,
      description: spec.valence ?? "",
      input_schema: spec.input ?? { type: "object" },
    };
  });
}

// --- inbound: Anthropic response → turn ---

export function translateResponse(response) {
  return {
    role: response.role,
    parts: response.content.map(blockToPart),
    meta: {
      usage: response.usage,
      stop: response.stop_reason,
      model: response.model,
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
        input: JSON.stringify(block.input),
      };
    default:
      return { type: "text", text: JSON.stringify(block) };
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
          stop: event.delta.stop_reason,
          usage: event.usage,
        },
      };

    case "message_stop":
      return null; // /turn/close already emitted on message_delta

    default:
      return null; // ping, etc — skip
  }
}
