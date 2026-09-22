import { v } from "../v.js";

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
]);

export const Part = {};

Part.Text = v.object({
  type: v.const("text"),
  text: v.string(),
});

Part.Image = v.object({
  type: v.const("image"),
  data: v.string(),
  media: v.string(),
});

Part.Audio = v.object({
  type: v.const("audio"),
  data: v.string(),
  media: v.string(),
});

Part.Video = v.object({
  type: v.const("video"),
  data: v.string(),
  media: v.string(),
});

Part.Document = v.object({
  type: v.const("document"),
  data: v.string(),
  media: v.string(),
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
  output: v.record(v.string(), v.unknown()),
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
]);

export const Turn = v.object({
  role: Role,
  parts: v.array(Part.Any),
  meta: v.union([v.record(v.string(), v.unknown()), v.null()]).optional(),
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
export const axes = ["intelligence", "reasoning", "speed", "thrift"];

export const Tune = v
  .array(v.number({ minimum: 0, maximum: 1 }), { minItems: 3, maxItems: 4 })
  .desc(
    "Capability vector [intelligence, reasoning, speed, thrift] — each 0-1, 1 = maximal. Providers may omit thrift (cortex pads 0.5).",
  );

// named points in tune-space (the `tiers` table on the cortex realizes them).
export const Tier = v
  .union([
    v.const("frugal"),
    v.const("fast"),
    v.const("balanced"),
    v.const("capable"),
    v.const("unleashed"),
    v.const("eager"),
  ])
  .desc(
    "A named desire in tune-space: frugal=cheap+fast, balanced=even trade, capable=strong+moderate cost, unleashed=max capability cost-no-object, eager=engagement-first.",
  );

export const Channels = v.object({
  in: v.array(Channel),
  out: v.array(Channel),
});

export const Tool = v.object({
  name: v.string(),
  valence: v.string().optional(),
  input: v.unknown().optional(),
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
  tune: Tune,
  context: v.integer().optional(),
  options: v.integer({ minimum: 2 }).optional().desc("Depth — the largest answer space one choice question may carry. Example: 255"),
  choices: v.union([v.integer({ minimum: 1 }), v.null()]).optional().desc("Width — questions in one choice render; null unbounded. Example: 1"),
  channels: v
    .object({ in: v.array(v.unknown()), out: v.array(v.unknown()) }, { additionalProperties: true })
    .optional(),
  via: v.record(v.string(), v.unknown()),
});

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
  primer: v.unknown().desc('What is under judgment. Example: { expected: "Vado al mercato.", answer: "Io vado al mercato domani." }'),
  questions: v.record(v.string(), Choice.Question).desc('One or more, keyed by the caller; every answer returns under its key. Example: { same: { type: "choice", ask: "Does `answer` mean `expected`?", options: { yes: null, no: null } } }'),
});
Choice.Answer = v.union([v.record(v.string(), Probability), v.array(Probability), Probability]);
Choice.Verdict = v.record(v.string(), Choice.Answer).desc("One distribution per question key, in the question's own shape. Example: { same: { yes: 0.03, partly: 0.96, no: 0.01 }, grade: [0.01, 0.97, 0.02], ok: 0.97 }");

export const Packet = {};

Packet.TurnOpen = v.object({
  event: v.const("/turn/open"),
  turn: v.object({ role: v.string() }),
});

Packet.PartOpen = v.object({
  event: v.const("/part/open"),
  index: v.integer(),
  part: Part.Any,
});

Packet.PartDelta = v.object({
  event: v.const("/part/delta"),
  index: v.integer(),
  delta: v.record(v.string(), v.unknown()),
});

Packet.PartClose = v.object({
  event: v.const("/part/close"),
  index: v.integer(),
});

Packet.TurnClose = v.object({
  event: v.const("/turn/close"),
  meta: v.record(v.string(), v.unknown()).optional(),
});

Packet.Any = v.union([
  Packet.TurnOpen,
  Packet.PartOpen,
  Packet.PartDelta,
  Packet.PartClose,
  Packet.TurnClose,
]);

Packet.ToolCall = v.object({
  event: v.const("/tool/call"),
  id: v.string(),
  name: v.string(), // @beef name? tool name? signature! rename to toolcall.signature or toolcall.nature
  input: v.record(v.string(), v.unknown()),
});

Packet.ToolYield = v.object({
  event: v.const("/tool/yield"),
  id: v.string(),
  result: v.object({
    condition: v.string(),
    output: v.record(v.string(), v.unknown()),
  }),
});

Packet.TurnFull = v.object({
  event: v.const("/turn/full"),
  turn: Turn,
});

Packet.ResponseClose = v.object({
  event: v.const("/response/close"),
  meta: v.object(
    {
      state: State,
      rounds: v.integer(),
    },
    { additionalProperties: true },
  ),
});

export const Word = v.object({
  word: v.string(),
  start: v.number().optional(),
  end: v.number().optional(),
  confidence: v.number().optional(),
  language: v.string().optional(),
});

export const Audio = {};

Audio.Packet = v.object({
  event: v.const("/audio/packet"),
  audio: v.string(),
  rate: v.integer(),
  codec: v.string().optional(),
  pts: v.number().optional(),
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
});

Audio.Close = v.object({
  event: v.const("/audio/close"),
  meta: v.record(v.string(), v.unknown()).optional(),
});

Audio.Any = v.union([Audio.Packet, Audio.Close]);

export const Verbatim = {};

Verbatim.Commit = v.object({
  event: v.const("/verbatim/commit"),
  text: v.string(),
});

Verbatim.Partial = v.object({
  event: v.const("/verbatim/partial"),
  transcript: v.string(),
});

Verbatim.Eager = v.object({
  event: v.const("/verbatim/eager"),
  transcript: v.string(),
});

Verbatim.Resume = v.object({
  event: v.const("/verbatim/resume"),
});

Verbatim.Final = v.object({
  event: v.const("/verbatim/final"),
  transcript: v.string(),
  segment: v.integer().optional(),
  words: v.array(Word).optional(),
});

Verbatim.Polish = v.object({
  event: v.const("/verbatim/polish"),
  transcript: v.string(),
  segments: v.array(v.integer()),
});

Verbatim.Any = v.union([
  Packet.TurnOpen,
  Packet.TurnClose,
  Verbatim.Commit,
  Verbatim.Partial,
  Verbatim.Eager,
  Verbatim.Resume,
  Verbatim.Final,
  Verbatim.Polish,
]);

Packet.Response = v.union([
  Packet.TurnOpen,
  Packet.PartOpen,
  Packet.PartDelta,
  Packet.PartClose,
  Packet.TurnClose,
  Packet.ToolCall,
  Packet.ToolYield,
  Packet.TurnFull,
  Packet.ResponseClose,
]);

const shared = {
  tune: v.union([Tier, Tune]).optional().desc('Desire in tune-space; the cortex resolves the faculty on it. Example: "fast"'),
};

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
Policy.choice = v.object({ ...shared }, { default: {} });

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

Hallucination.choice = v.object({
  ...controlled(Policy.choice),
  ...Choice.Round.properties,
});

export const Context = v.object({
  input: v.unknown().desc("Hallucination[avenue], filled; lowering rewrites it to the wire Request"),
  output: v.unknown().optional(),
  controller: v.unknown().desc("The record's controller, lifted; is.Controller"),
  policy: v.union([Policy.dialogue, Policy.verbatim, Policy.speech, Policy.choice]).desc("The record's policy, lifted; lowering strips it off input"),
  tools: v.unknown().optional().desc("The armed Vector, lifted off the record by lowering"),
  steps: v.array(v.unknown()),
  signal: v.unknown(),
}).desc('What a hallucinate middleware sees. Example: { input: { turns: [] }, output: undefined, controller, policy: { rounds: 10, backoff: [1000, 4000] }, steps, signal }');
Hallucination.Context = Context;
