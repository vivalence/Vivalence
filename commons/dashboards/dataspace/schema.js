export const SETS = [
  { name: "kernel", entities: ["literal", "symbol"] },
  { name: "daemon", entities: ["mode", "user"] },
  { name: "userspace", entities: ["intent", "thread", "buffer", "turn"] },
  { name: "transient", entities: ["activity"] },
];

export const CHECKS = {
  "thread.phase": ["inert", "manual", "continuous", "escort", "stream"],
  "buffer.status": ["PENDING", "ACTIVE", "DONE", "ERROR", "STALE"],
  "turn.role": ["user", "assistant"],
};

export const ENUMS = {
  mode: [
    "BOOTED", "APPLICATION", "STANDALONE", "TOPOGRAPHICAL", "TOPOLOGICAL",
    "DATASET", "DATASINK", "HARNESSED", "CONVERSATIONAL", "AGENTIC", "TOOLING",
    "EMITTER", "GENERATIVE", "EXPOSED", "INTENTED", "FRAUGHT", "MOUNTED",
  ],
  thread: ["MASKED", "AIMED", "QUEUEING", "LABELED", "INTELLIGENT", "VOCAL"],
  buffer: ["LABELED"],
  intent: ["LABELED"],
  symbol: ["ONTOLOGICAL", "LABELED", "TOPOGRAPHICAL"],
};

export const ONTOLOGIES = {
  part: ["LABELED", "SOURCED", "MODELED", "PARAMETRIC", "COUNTED", "SEQUENCED"],
  placement: ["LABELED", "PLACED", "JOINED"],
  step: ["LABELED", "INSTRUCTED", "PREPARED"],
};

export const TRAIT_SCHEMA = {
  LABELED: [{ key: "name", kind: "string" }, { key: "description", kind: "string", optional: true }],
  SOURCED: [
    { key: "file", kind: "string" }, { key: "object", kind: "string", optional: true },
    { key: "scale", kind: "number", optional: true }, { key: "url", kind: "string", optional: true },
    { key: "credit", kind: "string", optional: true },
  ],
  MODELED: [
    { key: "file", kind: "string" }, { key: "tris", kind: "integer", optional: true },
    { key: "bbox", kind: "json", optional: true },
  ],
  PARAMETRIC: [{ key: "generator", kind: "string" }, { key: "params", kind: "json" }],
  COUNTED: [{ key: "qty", kind: "integer" }],
  SEQUENCED: [{ key: "steps", kind: "json" }],
  PLACED: [
    { key: "layer", kind: "string" }, { key: "name", kind: "string" },
    { key: "parent", kind: "string", optional: true }, { key: "ref", kind: "string" },
    { key: "translation", kind: "json", optional: true }, { key: "rotation", kind: "json", optional: true },
    { key: "scale", kind: "json", optional: true }, { key: "active", kind: "boolean", optional: true },
  ],
  JOINED: [
    { key: "joins", kind: "json" },
    { key: "torque", kind: "enum", options: ["loose", "snug", "tight"], optional: true },
  ],
  INSTRUCTED: [
    { key: "text", kind: "json" }, { key: "warn", kind: "json", optional: true },
    { key: "images", kind: "json", optional: true },
  ],
  PREPARED: [{ key: "parts", kind: "json", optional: true }, { key: "tools", kind: "json", optional: true }],
  INTELLIGENT: [
    { key: "tune", kind: "string", optional: true },
    { key: "effort", kind: "enum", options: ["none", "low", "medium", "high"], optional: true },
    { key: "rounds", kind: "integer", optional: true },
    { key: "thinking", kind: "boolean", optional: true },
  ],
  VOCAL: [
    { key: "language", kind: "string", optional: true }, { key: "tune", kind: "string", optional: true },
    { key: "polish", kind: "boolean", optional: true },
  ],
  ONTOLOGICAL: [], TOPOGRAPHICAL: [], MASKED: [], AIMED: [], QUEUEING: [],
};

export const OPS = ["$eq", "$ne", "$like", "$in", "$nin", "$gt", "$gte", "$lt", "$lte", "$null", "traits"];

export const ALL_VERBS = [
  "find", "findOne", "findOneOrFail", "findAndCount", "count",
  "create", "upsert", "ensure", "updateOne", "update", "removeOne", "remove", "subscribe",
];
