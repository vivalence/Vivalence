import { v } from "@vivalence/typology";

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
  schema: v.string().optional(),
});

Part.ToolUse = v.object({
  type: v.const("tool_use"),
  id: v.string(),
  name: v.string(),
  input: v.string(),
});

Part.ToolResult = v.object({
  type: v.const("tool_result"),
  id: v.string(),
  output: v.string(),
});

Part.Thinking = v.object({
  type: v.const("thinking"),
  text: v.string(),
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
]);

export const Tune = v.array(v.number({ minimum: 0, maximum: 1 }), { minItems: 3, maxItems: 3 });

export const Tier = v.union([
  v.const("frugal"),
  v.const("balanced"),
  v.const("capable"),
  v.const("unleashed"),
]);

export const Channels = v.object({
  in: v.array(Channel),
  out: v.array(Channel),
});

export const Spec = v.object({
  tune: Tune,
  context: v.integer(),
});

export const Faculty = v.object({
  type: FacultyType,
  channels: Channels,
  spec: Spec,
  via: v.record(v.string(), v.unknown()),
});

export const Packet = {};

Packet.TurnOpen = v.object({
  event: v.const("turn.open"),
  turn: v.object({ role: v.string() }),
});

Packet.PartOpen = v.object({
  event: v.const("part.open"),
  index: v.integer(),
  part: Part.Any,
});

Packet.PartDelta = v.object({
  event: v.const("part.delta"),
  index: v.integer(),
  delta: v.record(v.string(), v.unknown()),
});

Packet.PartClose = v.object({
  event: v.const("part.close"),
  index: v.integer(),
});

Packet.TurnClose = v.object({
  event: v.const("turn.close"),
  meta: v.record(v.string(), v.unknown()).optional(),
});

Packet.Any = v.union([
  Packet.TurnOpen,
  Packet.PartOpen,
  Packet.PartDelta,
  Packet.PartClose,
  Packet.TurnClose,
]);
