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

// tools may speak the yield lexicon: output (the message) rides back to the
// model, entities/object stay app-side on the part.
Part.ToolResult = v.object({
  type: v.const("tool_result"),
  id: v.string(),
  output: v.unknown(),
  entities: v.record(v.string(), v.unknown()).optional(),
  object: v.unknown().optional(),
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
  meta: v.record(v.string(), v.unknown()).optional(),
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
  object: v.object({}, { additionalProperties: true }).optional(),
});

export const Request = v.object({
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
  channels: v
    .object({ in: v.array(v.unknown()), out: v.array(v.unknown()) }, { additionalProperties: true })
    .optional(),
  via: v.record(v.string(), v.unknown()),
});

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
    message: v.unknown(),
    entities: v.record(v.string(), v.unknown()),
    object: v.unknown(),
  }),
});

Packet.TurnFull = v.object({
  event: v.const("/turn/full"),
  turn: Turn,
});

Packet.SessionClose = v.object({
  event: v.const("/session/close"),
  state: State,
  rounds: v.integer(),
  meta: v.record(v.string(), v.unknown()).optional(),
});

Packet.Session = v.union([
  Packet.TurnOpen,
  Packet.PartOpen,
  Packet.PartDelta,
  Packet.PartClose,
  Packet.TurnClose,
  Packet.ToolCall,
  Packet.ToolYield,
  Packet.TurnFull,
  Packet.SessionClose,
]);
