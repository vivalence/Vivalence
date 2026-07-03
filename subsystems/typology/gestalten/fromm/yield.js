import { is } from "@vivalence/typology";

// every yield across every seam is the same four channels, sparsely filled:
// condition (how production ended) · message (utterance for the mind across the
// seam) · entities (dataspace citizens, keyed by entity name — key IS the type) ·
// object (schema-shaped value for the caller's code). kinds are rows of one
// truth-table (pattern.js patternmap idiom): name + sniff + fill. a declared
// `kind` on the payload forces perspective; the sniffer carries the default.
const text = (parts) =>
  parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join(" ") || null;

const yieldmap = [
  [
    "emission",
    (thing) => is.yieldish(thing),
    (thing) => ({
      condition: thing.condition,
      message: null,
      entities: thing.entities,
      object: null,
    }),
  ],
  [
    "turn",
    (thing) => is.string(thing?.role) && is.array(thing?.parts),
    (thing) => ({
      condition: ["error", "abort"].includes(thing.meta?.stop) ? "ERROR" : "NOMINAL",
      message: text(thing.parts),
      entities: {},
      object: thing.object ?? thing.parts.find((part) => part.type === "object")?.data ?? null,
    }),
  ],
  [
    "result",
    (thing) => thing?.type === "tool_result",
    (thing) => ({
      condition: thing.output?.error ? "ERROR" : "NOMINAL",
      message: thing.output ?? null,
      entities: thing.entities ?? {},
      object: thing.object ?? null,
    }),
  ],
  [
    "opaque",
    () => true,
    (thing) => ({
      condition: "NOMINAL",
      message: null,
      entities: {},
      object: thing ?? null,
    }),
  ],
];

const probe = (thing) =>
  yieldmap.find(([kind]) => kind === thing?.kind) ??
  yieldmap.find(([, sniff]) => sniff(thing));

const reader = (thing) => {
  const [kind, , fill] = probe(thing);
  const filled = fill(thing);
  return {
    get kind() {
      return kind;
    },
    get condition() {
      return filled.condition;
    },
    get message() {
      return filled.message;
    },
    get entities() {
      return filled.entities;
    },
    get object() {
      return filled.object;
    },
  };
};

export { reader as yield };
