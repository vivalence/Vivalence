export function turnText(turn) {
  const parts = turn?.parts ?? [];
  return parts
    .filter((part) => part?.type === "text")
    .map((part) => part.text)
    .join("");
}

export function turnThinking(turn) {
  const parts = turn?.parts ?? [];
  return parts
    .filter((part) => part?.type === "thinking")
    .map((part) => part.text)
    .filter(Boolean)
    .join("\n\n");
}

const resultKey = (part) => part.tool_use_id ?? part.id;

export function toolResults(turns) {
  const results = new Map();
  for (const turn of turns ?? [])
    for (const part of turn?.parts ?? [])
      if (part?.type === "tool_result") results.set(resultKey(part), part);
  return results;
}

export const isToolTurn = (turn) => {
  const parts = turn?.parts ?? [];
  return parts.length > 0 && parts.every((part) => part?.type === "tool_result");
};

// a lexicon BAG carries message/object or entity-array keys; anything else is an
// alien dialect result and displays raw
const settled = (result) => {
  const output = result.output ?? result.content ?? null;
  const bag =
    output &&
    typeof output === "object" &&
    !Array.isArray(output) &&
    ("message" in output || "object" in output || Object.values(output).every(Array.isArray))
      ? output
      : null;
  const entities = bag
    ? Object.fromEntries(
        Object.entries(bag).filter(([key]) => key !== "message" && key !== "object"),
      )
    : null;
  return {
    output: bag ? (bag.message ?? bag.object ?? null) : output,
    entities: entities && Object.keys(entities).length ? entities : null,
    object: bag ? (bag.object ?? null) : null,
    status:
      result.condition === "ERROR" || (bag ? bag.message?.error : output?.error)
        ? "error"
        : "ok",
  };
};

const pending = { output: null, entities: null, object: null, status: "running" };

export function turnTools(turn, results = toolResults([turn])) {
  const parts = turn?.parts ?? [];
  const uses = parts.filter((part) => part?.type === "tool_use");
  if (!uses.length)
    return parts
      .filter((part) => part?.type === "tool_result")
      .map((result) => ({ name: result.name ?? "result", input: null, ...settled(result) }));
  return uses.map((use) => {
    const result = results.get(use.id);
    return {
      name: use.name ?? use.id ?? "tool",
      input: use.input ?? null,
      ...(result ? settled(result) : pending),
    };
  });
}

export const toolCensus = (entities) =>
  Object.entries(entities ?? {})
    .map(([type, rows]) => ({ type, count: Array.isArray(rows) ? rows.length : 1 }))
    .filter((entry) => entry.count > 0);

export const toolPreview = (value) => {
  if (value === null || value === undefined) return "—";
  if (Array.isArray(value)) return `[ ${value.length} ]`;
  if (typeof value === "object") return `{ ${Object.keys(value).join(" · ")} }`;
  return String(value);
};

// the clipboard carries the turn as a record, never as prose — a pasted turn stays
// machine-readable, and the m26 bag keys survive the trip
export const turnClipboard = (turn, tools = []) => {
  const record = { role: turn?.role ?? "assistant" };
  if (turn?.createdAt) record.createdAt = turn.createdAt;
  const think = turnThinking(turn);
  if (think) record.thinking = think;
  const text = turnText(turn);
  if (text) record.text = text;
  if (tools.length)
    record.tools = tools.map((tool) => ({
      name: tool.name,
      input: tool.input ?? null,
      status: tool.status,
      ...(tool.output === null || tool.output === undefined ? {} : { output: tool.output }),
      ...(tool.entities ? { entities: tool.entities } : {}),
      ...(tool.object === null || tool.object === undefined ? {} : { object: tool.object }),
    }));
  return JSON.stringify(record, null, 2);
};

export const toolDigest = (input) => {
  const entries = Object.entries(input ?? {});
  if (!entries.length) return "";
  return entries
    .map(([key, value]) => `${key} ${typeof value === "object" ? "…" : value}`)
    .join(" · ");
};

const gloss = (row) => {
  const translated = row?.trait?.TRANSLATED;
  const faces = translated ? [translated.known, translated.learning].filter(Boolean) : [];
  if (faces.length) return faces.join(" · ");
  return row?.description ?? row?.text ?? row?.label ?? "";
};

export const bufferLabel = (buffer) => {
  const named =
    buffer?.data?.label ??
    buffer?.data?.title ??
    buffer?.label ??
    (typeof buffer?.mode === "string" ? buffer.mode : buffer?.mode?.slug);
  if (named) return named;
  return typeof buffer?.index === "number" ? `buffer ${buffer.index}` : "buffer";
};

export const entityRow = (row, key) => {
  const launchable = key === "buffer" && !!row?.id;
  const strength = typeof row?.strength === "number" ? row.strength : null;
  return {
    id: row?.id ?? null,
    term: key === "buffer" ? bufferLabel(row) : (row?.slug ?? row?.name ?? row?.label ?? row?.id ?? "—"),
    kind: row?.ontology ?? row?.status ?? row?.type ?? key,
    gloss: gloss(row),
    strength,
    band: launchable ? "runnable" : strengthBand(strength),
    fill: launchable ? 1 : strength,
    launchable,
  };
};

export const entityRows = (key, value) =>
  Array.isArray(value) && value.length && value.every((row) => row && typeof row === "object")
    ? value.map((row) => entityRow(row, key))
    : null;

export const channelSummary = (value) =>
  Array.isArray(value) ? `×${value.length}` : toolPreview(value);

export const scalarPairs = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const entries = Object.entries(value);
  if (!entries.length) return null;
  if (entries.some(([, held]) => held !== null && typeof held === "object")) return null;
  return entries.map(([key, held]) => ({ key, value: held === null ? "null" : String(held) }));
};

export const strengthBand = (strength) => {
  if (typeof strength !== "number") return null;
  if (strength >= 0.66) return "strong";
  if (strength >= 0.25) return "weak";
  return "unknown";
};

export const turnCensus = (tools) => {
  const totals = {};
  for (const tool of tools ?? [])
    for (const entry of tool.census ?? toolCensus(tool.entities))
      totals[entry.type] = (totals[entry.type] ?? 0) + entry.count;
  return Object.entries(totals).map(([type, count]) => ({ type, count }));
};

// the activity line carries the LAST call's entity summary, not the turn's sum — the
// line is nowrap and one round's digest is the fact the reader wants at rest
export const turnDigest = (tools) => {
  const last = (tools ?? []).at(-1);
  if (!last) return [];
  return last.census ?? toolCensus(last.entities);
};

export function toolChannels(tool) {
  const channels = [];
  if (tool?.input) channels.push({ key: "input", value: tool.input, rows: null });
  for (const [key, value] of Object.entries(tool?.entities ?? {}))
    channels.push({ key, value, rows: entityRows(key, value) });
  if (tool?.object) channels.push({ key: "object", value: tool.object, rows: null });
  return channels.map((channel) => ({ ...channel, summary: channelSummary(channel.value) }));
}

export const toolBuffers = (tools) =>
  (tools ?? []).flatMap((tool) =>
    (tool.entities?.buffer ?? []).filter((buffer) => buffer && typeof buffer === "object"),
  );

export const turnUsage = (turn) => {
  const usage = turn?.meta?.usage;
  if (!usage) return null;
  const input = usage.input_tokens ?? usage.prompt_tokens ?? usage.input ?? 0;
  const output = usage.output_tokens ?? usage.completion_tokens ?? usage.output ?? 0;
  if (!input && !output) return null;
  return { input, output };
};

export const sessionUsage = (turns) =>
  (turns ?? []).reduce(
    (total, turn) => {
      const usage = turnUsage(turn);
      if (!usage) return total;
      return { input: total.input + usage.input, output: total.output + usage.output, seen: true };
    },
    { input: 0, output: 0, seen: false },
  );

export const tokens = (count) =>
  count >= 1000 ? `${(count / 1000).toFixed(1)}k` : String(Math.round(count));

export const turnManifest = (turn) => {
  const counts = {};
  for (const part of turn?.parts ?? []) counts[part?.type ?? "?"] = (counts[part?.type ?? "?"] ?? 0) + 1;
  return Object.entries(counts).map(([type, count]) => (count > 1 ? `${type} ×${count}` : type));
};

export function turnArtifacts(turn) {
  const parts = turn?.parts ?? [];
  return parts.filter(
    (part) =>
      part?.type === "image" ||
      part?.type === "audio" ||
      part?.type === "file" ||
      part?.type === "artifact",
  );
}
