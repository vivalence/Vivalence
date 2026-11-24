import { Type } from "typebox";
import { enhance, v } from "../v.js";
import { ID } from "../scalars/index.js";
import { Condition } from "../prototypes/yield.js";
import { Measure } from "./track.js";

export const Channel = v.union([
  v.const("text"),
  v.const("image"),
  v.const("audio"),
  v.const("video"),
  v.const("document"),
  v.const("object"),
  v.const("tool_use"),
  v.const("tool_result"),
  v.const("thinking"),
]);

export const FacultyType = v.union([
  v.const("dialogue"),
  v.const("object"),
  v.const("speech"),
  v.const("verbatim"),
  v.const("call"),
  v.const("choice"),
  v.const("picture"),
  // v.const("movie"),
  // v.const("sound"),
  // v.const("embedding"),
]);

export const Part = {};

Part.Text = v.object({
  type: v.const("text"),
  text: v.string(),
});

Part.Image = v.object({
  type: v.const("image"),
  data: v.string(),
  mime: v.string(),
});

Part.Audio = v.object({
  type: v.const("audio"),
  data: v.string(),
  mime: v.string(),
});

Part.Video = v.object({
  type: v.const("video"),
  data: v.string(),
  mime: v.string(),
});

Part.Document = v.object({
  type: v.const("document"),
  data: v.string(),
  mime: v.string(),
});

Part.File = v.object({
  type: v.const("file"),
  file: ID,
});

Part.Object = v.object({
  type: v.const("object"),
  data: v.record(v.string(), v.unknown()),
  schema: v.unknown().optional(),
});

Part.ToolUse = v.object({
  type: v.const("tool_use"),
  id: v.string(),
  name: v.string(),
  input: v.record(v.string(), v.unknown()),
});

// tools speak the yield lexicon: output is the ONE bag — message (mind-facing),
// object (caller-code-facing), and one key per entity type. The provider
// translate flattens message ?? object for the model; the whole bag persists on
// the part.
Part.ToolResult = v.object({
  type: v.const("tool_result"),
  id: v.string(),
  condition: v.string().optional(),
  product: v.record(v.string(), v.unknown()),
});

Part.Thinking = v.object({
  type: v.const("thinking"),
  text: v.string(),
  signature: v.string().optional(),
});

Part.Alien = v.object({
  type: v.const("alien"),
  dialect: v.string(),
  block: v.unknown(),
});

Part.Any = v.union([
  Part.Text,
  Part.Image,
  Part.Audio,
  Part.Video,
  Part.Document,
  Part.Object,
  Part.ToolUse,
  Part.ToolResult,
  Part.Thinking,
  Part.Alien,
]);

export const Role = v.union([v.const("system"), v.const("user"), v.const("assistant")]);

export const State = v.union([
  v.const("complete"),
  v.const("tools"),
  v.const("length"),
  v.const("abort"),
  v.const("error"),
  v.const("filter"),
  v.const("interrupted"),
]);

const tokens = (input, output, cost) => [
  { name: "input", unit: "tokens", amount: input },
  { name: "output", unit: "tokens", amount: output },
  ...(cost === undefined ? [] : [{ name: "cost", unit: "usd", amount: cost }]),
];

const DIALECTS = [
  [(usage) => "input" in usage, (usage) => tokens(usage.input, usage.output, usage.cost)],
  [
    (usage) => "prompt_tokens" in usage,
    (usage) => tokens(usage.prompt_tokens, usage.completion_tokens, usage.cost),
  ],
  [(usage) => "input_tokens" in usage, (usage) => tokens(usage.input_tokens, usage.output_tokens)],
];

const healed = (meta) => {
  if (meta.usage === undefined || Array.isArray(meta.usage)) return meta;
  const [, translate] = DIALECTS.find(([dialect]) => dialect(meta.usage));
  return {
    ...meta,
    usage: translate(meta.usage),
    provider: { usage: meta.usage, ...meta.provider },
  };
};

export const Meta = enhance(
  Type.Codec(
    v.object(
      {
        state: State.optional(),
        usage: v.union([v.array(Measure), v.record(v.string(), v.unknown())]).optional(),
        rounds: v.integer().optional(),
        fault: v.object({ kind: v.string(), message: v.union([v.string(), v.null()]) }).optional(),
        provider: v.record(v.string(), v.unknown()).optional(),
      },
      { additionalProperties: false },
    ),
  )
    .Decode(healed)
    .Encode((meta) => meta),
);

const stored = (part) => {
  if (part.type !== "tool_result" || !("output" in part)) return part;
  const { output, ...healed } = part;
  return { ...healed, product: output };
};

export const Parts = enhance(
  Type.Codec(v.array(v.record(v.string(), v.unknown())))
    .Decode((parts) => parts.map(stored))
    .Encode((parts) => parts),
);

export const Turn = v.object({
  role: Role,
  parts: v.array(Part.Any),
  meta: v.union([Meta, v.null()]).optional(),
});

// ── tune · a faculty's position in capability space ───────────────────────
// A faculty's `tune` is a point in a 4-axis space; a request's tune — or a
// named Tier — is a point of DESIRE in the same space. The cortex resolves by
// nearest neighbour (equal-weighted squared-Euclidean, `belt.array.nearest`):
// the faculty whose profile sits closest to the desire wins. Every axis is
// [0, 1], where 1 = maximal that virtue. The two CAPABILITY axes trade against
// the two ECONOMY axes — no faculty maxes all four.
//
//   0  intelligence  raw problem-solving capability   (haiku 0.1 → opus 0.9)
//   1  reasoning      deliberation depth / thinking    (sonnet 0.7, opus 1.0)
//   2  speed          inverse latency; 1 = fastest     (opus 0.3, haiku 1.0)
//   3  thrift         cost economy;    1 = cheapest     (unleashed 0.2, frugal 1.0)
//
// Providers may ship only the first three (intelligence, reasoning, speed);
// the cortex pads `thrift` to 0.5 on register. Because nearest() loops over the
// DESIRE's length, a 3-axis query ignores thrift entirely. The axis names
// describe the dialogue case; for speech/verbatim faculties the same vector is
// an opaque positioning key that just distinguishes variants by proximity.
export const axes = ["intelligence", "speed", "thrift"];

export const Tune = v
  .array(v.number({ minimum: 0, maximum: 1 }), { minItems: 3, maxItems: 3 })
  .desc("Capability vector [intelligence, speed, thrift] — each 0-1, 1 = maximal. Example: [0.6, 0.4, 0.4]");

export const TIERS = {
  frugal: { tune: [0.1, 0.9, 1.0] },
  fast: { tune: [0.4, 1.0, 0.8] },
  balanced: { tune: [0.5, 0.5, 0.5] },
  capable: { tune: [0.9, 0.2, 0.5] },
  unleashed: { tune: [1.0, 0.9, 0.1] },
  ear: { type: "verbatim", tune: [0.3, 1.0, 0.5] },
  tongue: { type: "speech", tune: [0.3, 0.9, 0.5] },
  actor: { type: "dialogue", tune: [0.4, 1.0, 0.8] },
  director: { type: "dialogue", tune: [0.9, 0.2, 0.5] },
};

export const Tier = v
  .enum(Object.keys(TIERS))
  .desc("A name in TIERS: a point in tune-space, and for ear · tongue · actor · director the type it is worn on.");

export const REQUIRES = {
  HARNESS: [["dialogue"]],
  CONVERSATION: [["call"], ["verbatim", "dialogue", "speech"]],
};

export const Channels = v.object({
  in: v.array(Channel),
  out: v.array(Channel),
});

export const Tool = v.object({
  name: v.string(),
  valence: v.string().optional(),
  input: v.unknown().optional(),
  output: v.unknown().optional(),
});

export const Settings = v.object(
  {
    maxTokens: v.integer().optional(),
    thinking: v.boolean().optional(),
    thinkingBudget: v.integer().optional(),
    temperature: v.number().optional(),
    tool_choice: v.record(v.string(), v.unknown()).optional(),
  },
  { additionalProperties: true },
);

export const Output = v.object({
  schema: v.object({}, { additionalProperties: true }).optional(),
});

// system = named sections, insertion-ordered; a cache mark naming a section key
// pins cache_control to that block. Stable sections first, volatile last.
export const Request = v.object({
  system: v.record(v.string(), v.unknown()).optional(),
  turns: v.array(Turn),
  tools: v.array(Tool).optional(),
  settings: Settings.optional(),
  output: Output.optional(),
  cache: v.object({ marks: v.array(v.string()) }).optional(),
});

// the register-time guard checks only what the cortex resolves on — type, tune,
// and a delivery record. `channels` is descriptive metadata the cortex never
// reads, so it's validated loosely (any array); Channels above stays the strict
// documented vocabulary for consumers that DO care about the encoding.
export const Faculty = v.object({
  type: v.string(),
  id: v.string().desc('The faculty, exact — a model id, a voice id. Example: "openai/gpt-image-2"'),
  model: v
    .string()
    .optional()
    .desc('The weights, where id is a name of ours. Example: "openai/gpt-oss-120b"'),
  upstream: v
    .string()
    .optional()
    .desc('Who runs the weights behind a broker; one per faculty, never a fallback. Example: "groq"'),
  tune: Tune,
  context: v.integer().optional(),
  options: v.integer({ minimum: 2 }).optional().desc("Depth — the largest answer space one choice question may carry. Example: 255"),
  choices: v.union([v.integer({ minimum: 1 }), v.null()]).optional().desc("Width — questions in one choice render; null unbounded. Example: 1"),
  channels: v
    .object({ in: v.array(v.unknown()), out: v.array(v.unknown()) }, { additionalProperties: true })
    .optional(),
  via: v.record(v.string(), v.unknown()),
});

export const FacultyRecipe = v.object(
  { id: v.string(), tier: Tier.optional() },
  { additionalProperties: true },
);

export const FacultyMask = v.object(
  { type: v.string(), id: v.string(), tier: Tier.optional() },
  { additionalProperties: true },
);

const Probability = v.number({ minimum: 0, maximum: 1 });
const Rubric = v.union([v.string(), v.record(v.string(), v.unknown()), v.null()]);
const Ask = v.union([v.string(), v.record(v.string(), v.unknown())]).desc('A question, or a question with the data it names. Example: "Does `answer` mean `expected`?"');

export const Choice = {};
Choice.Question = v.union([
  v.object({
    type: v.const("choice").optional(),
    ask: Ask,
    options: v.record(v.string(), Rubric).desc('A named set of two or more, a rubric on any; the answer is a distribution over the names. Example: { yes: null, partly: "extra or missing detail", no: null }'),
  }, { additionalProperties: false }),
  v.object({
    type: v.const("score").optional(),
    ask: Ask,
    levels: v.array(Rubric, { minItems: 2 }).desc('An ordered set, low to high; the answer is a distribution by index. Example: ["wrong", "close", "exact"]'),
  }, { additionalProperties: false }),
  v.object({
    type: v.const("noul").optional(),
    ask: Ask.desc('A proposition; the answer is its probability. Example: "Is `answer` grammatical Italian?"'),
  }, { additionalProperties: false }),
]).desc("Tagged by kind; shard.hallucinate.tagging fills an absent tag from the shape before the faculty sees it");
Choice.Round = v.object({
  system: v.unknown().desc('What is under judgment. Example: { expected: "Vado al mercato.", answer: "Io vado al mercato domani." }'),
  questions: v.record(v.string(), Choice.Question).desc('One or more, keyed by the caller; every answer returns under its key. Example: { same: { type: "choice", ask: "Does `answer` mean `expected`?", options: { yes: null, no: null } } }'),
});
Choice.Answer = v.union([v.record(v.string(), Probability), v.array(Probability), Probability]);
Choice.Verdict = v.record(v.string(), Choice.Answer).desc("One distribution per question key, in the question's own shape. Example: { same: { yes: 0.03, partly: 0.96, no: 0.01 }, grade: [0.01, 0.97, 0.02], ok: 0.97 }");

export const Packet = {};

Packet.TurnOpen = v.object({
  event: v.const("/turn/open"),
  turn: v.object({
    role: v.string(),
    id: ID.optional().desc('The turn the runtime opened for this reply; every later packet pours into it. Example: "0199f3a2-7c1e-7b40-9d2a-5e6f8a1b2c3d"'),
  }),
});

Packet.PartOpen = v.object({
  event: v.const("/part/open"),
  index: v.integer(),
  part: Part.Any,
});

Packet.PartDelta = v.object({
  event: v.const("/part/delta"),
  index: v.integer(),
  part: v.record(v.string(), v.unknown()),
});

Packet.PartDraft = v.object({
  event: v.const("/part/draft"),
  index: v.integer(),
  part: v
    .record(v.string(), v.unknown())
    .desc('The part\'s provisional fields, replaced by the next draft. Example: { text: "vado al mer" }'),
});

Packet.PartFull = v.object({
  event: v.const("/part/full"),
  index: v.integer(),
  part: Part.Any.desc("The part, rewritten whole: a polish, a correction."),
  turn: ID
    .optional()
    .desc('A sealed turn this rewrites; absent → the open one. Example: "0199f3a2-7c1e-7b40-9d2a-5e6f8a1b2c3d"'),
});

Packet.PartClose = v.object({
  event: v.const("/part/close"),
  index: v.integer(),
});

Packet.TurnClose = v.object({
  event: v.const("/turn/close"),
  turn: v.object({ meta: Meta.optional() }),
});

Packet.TurnEager = v.object({ event: v.const("/turn/eager") });

Packet.TurnResume = v.object({ event: v.const("/turn/resume") });

Packet.Any = v.union([
  Packet.TurnOpen,
  Packet.PartOpen,
  Packet.PartDelta,
  Packet.PartClose,
  Packet.TurnClose,
]);

Packet.TurnFull = v.object({
  event: v.const("/turn/full"),
  turn: Turn,
});

Packet.ResponseClose = v.object({
  event: v.const("/response/close"),
  response: v.object({ meta: Meta }),
});

export const Audio = {};

Audio.Packet = v.object({
  event: v.const("/audio/packet"),
  pts: v.number().optional(),
  audio: v.object({
    data: v.string(),
    rate: v.integer(),
    codec: v.string().optional(),
    align: v
      .array(
        v.object({
          text: v.string().optional(),
          offset: v.integer().optional(),
          start: v.number().optional(),
          end: v.number().optional(),
        }),
      )
      .optional(),
  }),
});

Audio.Close = v.object({
  event: v.const("/audio/close"),
  audio: v.object({ meta: Meta.optional() }),
});

Audio.Played = v.object({
  event: v.const("/audio/played"),
  pts: v.number().desc("Seconds of the reply the speaker has played, from its first packet. Example: 2.4"),
});

Audio.Any = v.union([Audio.Packet, Audio.Close]);

Packet.Response = v.union([
  Packet.TurnOpen,
  Packet.TurnEager,
  Packet.TurnResume,
  Packet.PartOpen,
  Packet.PartDelta,
  Packet.PartDraft,
  Packet.PartFull,
  Packet.PartClose,
  Packet.TurnClose,
  Packet.TurnFull,
  Packet.ResponseClose,
]);

Packet.Call = v.union([Packet.Response, Audio.Packet, Audio.Close]);

export const Response = v.object(
  {
    condition: Condition.desc('How the request ended. Example: "NOMINAL"'),
    product: v
      .record(v.string(), v.unknown())
      .desc('What the request made: message, object, entities by type. Example: { message: "ciao means hello" }'),
    turns: v.array(Turn).desc("The turns this request produced, in order."),
    meta: Meta.desc('Why and how it stopped. Example: { state: "complete", rounds: 1 }'),
  },
  { additionalProperties: false },
);

export const Selector = {
  provider: v.string().optional().desc('A provider slug, exact. Example: "openrouter"'),
  id: v.string().optional().desc('A faculty id, exact. Example: "openai/gpt-image-2"'),
  tier: Tier.optional().desc('A named point in tune-space; ranks what the exact keys leave. Example: "fast"'),
  tune: Tune.optional().desc("A point in tune-space; ranks what the exact keys leave. Example: [0.4, 1.0, 0.8]"),
};
const shared = Selector;

export const Policy = {};
Policy.dialogue = v.object({
  ...shared,
  rounds: v.integer({ minimum: 1, default: 10 }).desc("Tool rounds per turn. Example: 3"),
  backoff: v.array(v.integer(), { default: [1000, 4000] }).desc("Retry waits in ms. Example: [1000, 4000]"),
  cache: v.object({ marks: v.array(v.string()) }).optional().desc('System keys, and "tools", that take a cache breakpoint; lowering projects it to Request.cache and derives it when absent. Example: { marks: ["context", "tools"] }'),
}, { default: {} }).desc("The respond loop, app-side; nothing here crosses the wire.");
Policy.object = Policy.dialogue;
Policy.verbatim = v.object({
  ...shared,
  harmonize: v.object({ window: v.integer().optional(), tolerance: v.number().optional(), tail: v.integer().optional() }).optional().desc("belt.verbatim.harmonize options, applied over the faculty's stream. Example: { window: 2 }"),
}, { default: {} });
Policy.speech = v.object({ ...shared }, { default: {} });
Policy.call = v.object({
  ...shared,
  hear: v.object({ ...shared }).optional().desc('The ear a cascade hears with. Example: { provider: "elevenlabs" }'),
  mind: v.object({ ...shared }).optional().desc('The mind a cascade thinks with. Example: { tier: "fast" }'),
  speak: v.object({ ...shared }).optional().desc('The mouth a cascade speaks with. Example: { id: "21m00Tcm4TlvDq8ikWAM" }'),
  rounds: v.integer({ minimum: 1, default: 10 }).desc("Tool rounds per turn. Example: 3"),
}, { default: {} });
Policy.choice = v.object({ ...shared }, { default: {} });
Policy.picture = v.object({ ...shared }, { default: {} });

const controlled = (policy) => ({
  controller: v.unknown().desc('A live Controller — required; is.Controller gates it, no schema can. Example: new Controller({ stdout: new Span("hallucination") })'),
  policy,
});

export const Hallucination = {};

Hallucination.dialogue = v.object({
  ...controlled(Policy.dialogue),
  system: v.record(v.string(), v.unknown()).optional(),
  turns: v.array(Turn, { default: [] }),
  tools: v.unknown().optional().desc("A tools Vector, or an already-lowered catalog. Example: new Vector()"),
  settings: Settings.optional(),
  output: Output.optional(),
});
Hallucination.object = Hallucination.dialogue;

Hallucination.verbatim = v.object({
  ...controlled(Policy.verbatim),
  source: v.unknown().desc("An async iterable of Audio.Packet. Example: request.subscribe()"),
  settings: Settings.optional().desc('Provider knobs, opaque. Example: { language: "it" }'),
});

Hallucination.speech = v.object({
  ...controlled(Policy.speech),
  source: v.unknown().desc('Text, or an async iterable of text. Example: "buongiorno"'),
  settings: Settings.optional().desc('Provider knobs, opaque. Example: { voice: "aria" }'),
});

Hallucination.call = v.object({
  ...controlled(Policy.call),
  source: v.unknown().desc("An async iterable of Audio.Packet · Audio.Played. Example: request.subscribe()"),
  system: v.record(v.string(), v.unknown()).optional(),
  turns: v.array(Turn, { default: [] }),
  tools: v.unknown().optional().desc("A tools Vector, or an already-lowered catalog. Example: new Vector()"),
  settings: Settings.optional(),
});

Hallucination.choice = v.object({
  ...controlled(Policy.choice),
  ...Choice.Round.properties,
});

export const Picture = {};
Picture.Reference = v.object({
  image: Part.Image,
  role: v.union([v.const("style"), v.const("subject"), v.const("structure"), v.const("init")]).desc('What the provider is to take from it: paint like this · this thing · these edges and this composition · the picture being edited. Example: "style"'),
});
Picture.Settings = v.object(
  {
    size: v.string().optional().desc('WxH or an aspect the provider knows. Example: "1536x1024"'),
    aspect: v.string().optional().desc('W:H the provider maps onto its sizes; refused LOUD when the faculty lacks it. Example: "3:2"'),
    count: v.integer({ minimum: 1, maximum: 4 }).optional().desc("Pictures per request. Example: 2"),
    format: v.union([v.const("png"), v.const("webp"), v.const("jpeg")]).optional().desc('The bytes wanted back. Example: "webp"'),
    background: v.union([v.const("transparent"), v.const("opaque")]).optional().desc('Example: "transparent"'),
  },
  { additionalProperties: true },
).desc("Provider knobs; the four named ones every provider maps, the rest pass through opaque. Example: { aspect: \"3:2\", count: 1 }");
Picture.Request = v.object({
  prompt: v.string({ minLength: 1 }).desc('What to make or change. Example: "a red fox in loose watercolor, white paper showing"'),
  images: v.array(Picture.Reference, { default: [] }).desc("References, each with a role; the first `init` is the picture being edited. Example: []"),
  mask: Part.Image.optional().desc('Alpha = the hole to repaint, over the first init image. Example: { type: "image", mime: "image/png", data: "iVBOR…" }'),
  settings: Picture.Settings.optional(),
});
Picture.Response = v.object({
  images: v.array(Part.Image).desc('The pictures, in the provider\'s order. Example: [{ type: "image", mime: "image/png", data: "iVBOR…" }]'),
  revised: v.string().optional().desc('The prompt the provider actually painted from, when it rewrote ours. Example: "A red fox rendered in loose watercolor…"'),
  provider: v.string().optional().desc('The hallucinator that painted it, stamped by the belt. Example: "openrouter"'),
  id: v.string().optional().desc('The faculty that painted it, stamped by the belt. Example: "openai/gpt-image-2"'),
  meta: Meta.optional().desc('Usage in our words, the receipt under provider. Example: { usage: [{ name: "input", unit: "tokens", amount: 120 }] }'),
});
Hallucination.picture = v.object({
  ...controlled(Policy.picture),
  ...Picture.Request.properties,
});

export const Context = v.object({
  input: v.unknown().desc("Hallucination[avenue], filled; lowering rewrites it to the wire Request"),
  output: v.unknown().optional(),
  controller: v.unknown().desc("The record's controller, lifted; is.Controller"),
  policy: v.union([Policy.dialogue, Policy.verbatim, Policy.speech, Policy.choice, Policy.picture]).desc("The record's policy, lifted; lowering strips it off input"),
  tools: v.unknown().optional().desc("The armed Vector, lifted off the record by lowering"),
  steps: v.array(v.unknown()),
  signal: v.unknown(),
}).desc('What a hallucinate middleware sees. Example: { input: { turns: [] }, output: undefined, controller, policy: { rounds: 10, backoff: [1000, 4000] }, steps, signal }');
Hallucination.Context = Context;
