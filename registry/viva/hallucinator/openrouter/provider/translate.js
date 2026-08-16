const STATES = {
  stop: "complete",
  tool_calls: "tools",
  length: "length",
  content_filter: "filter",
  error: "error",
};

export function translateTurns(turns) {
  const messages = [];

  for (const turn of turns) {
    if (turn.role === "system") {
      messages.push({ role: "system", content: turn.parts.map(partToContent) });
      continue;
    }
    if (turn.role === "assistant") {
      messages.push(assistantToMessage(turn));
      for (const part of turn.parts.filter((part) => part.type === "tool_result"))
        messages.push(resultToMessage(part));
      continue;
    }
    const results = turn.parts.filter((part) => part.type === "tool_result");
    const remainder = turn.parts.filter((part) => part.type !== "tool_result");
    for (const part of results) messages.push(resultToMessage(part));
    if (remainder.length) messages.push({ role: turn.role, content: remainder.map(partToContent) });
  }

  return messages;
}

function resultToMessage(part) {
  const spoken = part.output?.message ?? part.output?.object ?? part.output;
  return {
    role: "tool",
    tool_call_id: part.id,
    content: typeof spoken === "string" ? spoken : JSON.stringify(spoken),
  };
}

function assistantToMessage(turn) {
  const message = { role: "assistant" };
  const content = [];
  const calls = [];
  let reasoning = "";

  for (const part of turn.parts) {
    if (part.type === "tool_result") {
      continue;
    } else if (part.type === "tool_use") {
      calls.push({
        id: part.id,
        type: "function",
        function: { name: part.name, arguments: JSON.stringify(part.input ?? {}) },
      });
    } else if (part.type === "thinking") {
      reasoning += part.text;
    } else {
      content.push(partToContent(part));
    }
  }

  if (content.length) message.content = content;
  if (calls.length) message.tool_calls = calls;
  if (reasoning) message.reasoning = reasoning;
  return message;
}

function partToContent(part) {
  switch (part.type) {
    case "alien":
      return part.block;
    case "text":
      return { type: "text", text: part.text };
    case "image":
      return { type: "image_url", image_url: { url: `data:${part.media};base64,${part.data}` } };
    case "document":
      return {
        type: "file",
        file: { filename: part.filename ?? "document.pdf", file_data: `data:${part.media};base64,${part.data}` },
      };
    default:
      return { type: "text", text: typeof part === "string" ? part : JSON.stringify(part) };
  }
}

export const RESPOND = {
  name: "respond",
  description: "Return the final result as structured data.",
};

export function buildParams(model, request, stream = false) {
  const sections = Object.values(request.system ?? {}).map((content) => ({
    role: "system",
    content: [{ type: "text", text: typeof content === "string" ? content : JSON.stringify(content) }],
  }));
  const messages = [...sections, ...translateTurns(request.turns)];
  const settings = request.settings ?? {};
  const marks = new Set(request.cache?.marks ?? []);
  const structured = request.output?.schema;
  const tool_choice = structured
    ? { type: "function", function: { name: RESPOND.name } }
    : settings.tool_choice;
  const params = {
    model: model.id,
    messages,
    max_tokens: settings.maxTokens ?? (model.thinking ? 32000 : 8192),
  };
  if (marks.has("context")) {
    const system = messages.findLast((message) => message.role === "system");
    if (system?.content?.length) system.content.at(-1).cache_control = { type: "ephemeral" };
  }
  if (stream) {
    params.stream = true;
    params.usage = { include: true };
  }
  params.reasoning = model.thinking
    ? settings.effort ? { effort: settings.effort } : { enabled: true }
    : { enabled: false };
  if (request.tools?.length) params.tools = translateTools(request.tools);
  if (structured)
    params.tools = [
      ...(params.tools ?? []),
      { type: "function", function: { name: RESPOND.name, description: RESPOND.description, parameters: structured } },
    ];
  if (tool_choice) params.tool_choice = tool_choice;
  return params;
}

export function translateTools(tools) {
  return tools.map((declaration) => ({
    type: "function",
    function: {
      name: declaration.name,
      description: declaration.valence ?? "",
      parameters: declaration.input ?? { type: "object" },
    },
  }));
}

export const fault = (error) => ({
  kind: error.status === 429 ? "throttled" : [502, 503].includes(error.status) ? "overloaded" : "request",
  retryable: [408, 429, 500, 502, 503].includes(error.status),
  provider: { status: error.status, message: error.message },
});

export function translateResponse(response) {
  const choice = response.choices[0];
  const parts = [];
  if (choice.message.reasoning) parts.push({ type: "thinking", text: choice.message.reasoning });
  if (choice.message.content) parts.push({ type: "text", text: choice.message.content });
  for (const call of choice.message.tool_calls ?? []) {
    parts.push({
      type: "tool_use",
      id: call.id,
      name: call.function.name,
      input: JSON.parse(call.function.arguments || "{}"),
    });
  }
  return {
    role: choice.message.role,
    parts,
    meta: {
      state: STATES[choice.finish_reason] ?? "error",
      usage: response.usage,
      provider: { finish_reason: choice.finish_reason, model: response.model },
    },
  };
}

export function streamTranslator() {
  let opened = false;
  let index = -1;
  let current = null;
  let closing = null;

  function open(kind, part, packets) {
    if (current !== null) packets.push({ event: "/part/close", index });
    index += 1;
    current = kind;
    packets.push({ event: "/part/open", index, part });
  }

  function translate(chunk) {
    const packets = [];
    const choice = chunk.choices?.[0];
    const delta = choice?.delta;

    if (delta && !opened) {
      opened = true;
      packets.push({ event: "/turn/open", turn: { role: delta.role ?? "assistant" } });
    }

    if (delta?.reasoning) {
      if (current !== "thinking") open("thinking", { type: "thinking", text: "" }, packets);
      packets.push({ event: "/part/delta", index, delta: { text: delta.reasoning } });
    }

    if (delta?.content) {
      if (current !== "text") open("text", { type: "text", text: "" }, packets);
      packets.push({ event: "/part/delta", index, delta: { text: delta.content } });
    }

    for (const call of delta?.tool_calls ?? []) {
      const kind = `tool_use:${call.index}`;
      if (current !== kind) {
        open(kind, { type: "tool_use", id: call.id, name: call.function?.name, input: "" }, packets);
      }
      if (call.function?.arguments) {
        packets.push({ event: "/part/delta", index, delta: { input: call.function.arguments } });
      }
    }

    if (choice?.finish_reason) {
      if (current !== null) {
        packets.push({ event: "/part/close", index });
        current = null;
      }
      closing = {
        event: "/turn/close",
        meta: {
          state: STATES[choice.finish_reason] ?? "error",
          usage: chunk.usage ?? null,
          provider: { finish_reason: choice.finish_reason, model: chunk.model },
        },
      };
    }

    if (chunk.usage && closing) {
      closing.meta.usage = chunk.usage;
      packets.push(closing);
      closing = null;
    }

    return packets;
  }

  function flush() {
    if (!closing) return [];
    const packets = [closing];
    closing = null;
    return packets;
  }

  return { translate, flush };
}
