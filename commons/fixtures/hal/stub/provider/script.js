// the script — a PURE function of the request. same turns in, same packets out, in a test and
// in the browser. two sources, one grammar: flags written in the prompt, and named scripts
// declared on the mask's statics, reached with --run.
//
//   --run <name>          expand statics.scripts[name] — itself a flag string
//   --deltas 40           text deltas                                 default 12
//   --pace 120ms          gap between packets                         default 40ms
//   --stall 4s            one long gap, after the first delta         default none
//   --tool lookup         call a tool ...
//   --rounds 2            ... this many times before answering        default 1
//   --fault retryable     throw — retryable takes the belt's backoff path
//   --timeout             yield nothing, ever; only the signal ends it
//   --object '{"a":1}'    what the object avenue answers
//   --say "text"          the text of the answer
//   --close length        seal the turn with that state and NO parts — length · filter · error
//
// the flags are parsed by Signal, the repo's own CLI grammar — prose around them is left alone.
import { Signal } from "@vivalence/typology";

export const DEFAULTS = { deltas: 12, pace: 40, stall: 0, tool: null, rounds: 1, fault: null, timeout: false, object: null, say: null, close: null };

const MS = { ms: 1, s: 1000 };
const DURATION = /^(\d+(?:\.\d+)?)(ms|s)?$/;
const duration = (value, fallback) => {
  const [, held, unit] = DURATION.exec(String(value ?? "")) ?? [];
  return held === undefined ? fallback : Number(held) * MS[unit ?? "ms"];
};

const json = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

export const flags = (source) => new Signal(String(source ?? "")).json.flags;

// the prose, with every flag taken out of it — what the stub echoes back when nothing says --say.
export const prose = (source) => new Signal(String(source ?? "")).json.parts.join(" ");

// one flag bag → one plan. --run expands first, so a written flag always beats the script it ran.
export function read(source, scripts = {}, depth = 0) {
  const held = flags(source);
  const plan = held.run && depth < 4 ? read(scripts[held.run] ?? "", scripts, depth + 1) : { ...DEFAULTS };
  if (held.deltas) plan.deltas = Number(held.deltas) || DEFAULTS.deltas;
  if (held.pace) plan.pace = duration(held.pace, DEFAULTS.pace);
  if (held.stall) plan.stall = duration(held.stall, 4000);
  if (held.tool) plan.tool = held.tool === true ? "lookup" : held.tool;
  if (held.rounds) plan.rounds = Number(held.rounds) || DEFAULTS.rounds;
  if (held.fault) plan.fault = held.fault === "retryable" ? "retryable" : "fatal";
  if (held.timeout) plan.timeout = true;
  if (held.object) plan.object = json(held.object);
  if (held.say) plan.say = String(held.say);
  if (held.close) plan.close = String(held.close);
  return plan;
}

export const spoken = (turns = []) => {
  for (let at = turns.length - 1; at >= 0; at -= 1) {
    if (turns[at].role !== "user") continue;
    const text = turns[at].parts?.find((part) => part.type === "text")?.text;
    if (text) return text;
  }
  return "";
};

// the round is READ off the turns, never counted in the provider — that is what keeps a second
// call with the same turns identical to the first.
export const round = (turns = []) =>
  turns.filter((turn) => turn.parts?.some((part) => part.type === "tool_result")).length;

// settings.script beats the prompt: a caller that never types can still script the run.
export function plan(request, statics = {}) {
  const scripts = statics.scripts ?? {};
  const said = spoken(request?.turns);
  const written = request?.settings?.script ?? said;
  const base = statics.default ? read(statics.default, scripts) : {};
  const plan = { ...DEFAULTS, ...base, ...read(written, scripts) };
  return { ...plan, say: plan.say ?? `[stub] ${prose(said) || "nothing said"}`, round: round(request?.turns) };
}

// an object answer with no --object: every leaf filled off the schema, deterministically.
export function shape(schema, text) {
  if (!schema || typeof schema !== "object") return { answer: text };
  if (schema.default !== undefined) return schema.default;
  if (schema.const !== undefined) return schema.const;
  if (schema.enum) return schema.enum[0];
  if (schema.anyOf || schema.oneOf) return shape((schema.anyOf ?? schema.oneOf)[0], text);
  const type = Array.isArray(schema.type) ? schema.type[0] : schema.type;
  if (type === "string") return text;
  if (type === "integer" || type === "number") return 42;
  if (type === "boolean") return true;
  if (type === "array") return [shape(schema.items, text)];
  if (type === "null") return null;
  return Object.fromEntries(Object.entries(schema.properties ?? {}).map(([key, held]) => [key, shape(held, text)]));
}
