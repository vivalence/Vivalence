import * as is from "../is/index.js";

// every yield across every seam is the same envelope: condition (how production
// ended) · output (the payload — ONE bag whose keys are payload words, message
// mind-facing / object caller-code-facing, or entity type names keyed singular,
// mirroring daemon.entities.*). kinds are rows of one truth-table (pattern.js
// patternmap idiom): name + sniff + fill. a declared `kind` on the payload forces
// perspective; the sniffer carries the default. a flat payload is recognized by a
// payload word or condition at top level — a bare entity-only bag must spell
// { output: { buffer } } explicitly.
const text = (parts) =>
  parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join(" ") || null;

const bag = (entries) =>
  Object.fromEntries(Object.entries(entries).filter(([, value]) => value != null));

const wrap = ({ condition = "NOMINAL", parts = [], ...payload }) => ({
  condition,
  product: payload.product ? payload.product : payload,
  parts,
});

const yieldmap = [
  [
    "response",
    (thing) => is.string(thing?.condition) && is.array(thing?.turns),
    (thing) => ({ condition: thing.condition, product: thing.product ?? {} }),
  ],
  [
    "emission",
    (thing) => is.yieldish(thing),
    (thing) => ({ condition: thing.condition, product: thing.product }),
  ],
  [
    "turn",
    (thing) => is.string(thing?.role) && is.array(thing?.parts),
    (thing) => ({
      condition: ["error", "abort", "filter"].includes(thing.meta?.state) ? "ERROR" : "NOMINAL",
      product: bag({
        message: text(thing.parts),
        object: thing.parts.find((part) => part.type === "object")?.data ?? null,
      }),
    }),
  ],
  [
    "result",
    (thing) => thing?.type === "tool_result",
    (thing) => ({
      condition: thing.condition ?? "NOMINAL",
      product: thing.product ?? {},
    }),
  ],
  [
    "utterance",
    (thing) => is.string(thing),
    (thing) => ({ condition: "NOMINAL", product: { message: thing } }),
  ],
  [
    "spoken",
    (thing) =>
      is.object(thing) &&
      ("product" in thing || "condition" in thing || "message" in thing || "object" in thing),
    wrap,
  ],
  [
    "opaque",
    () => true,
    (thing) => ({ condition: "NOMINAL", product: thing == null ? {} : { object: thing } }),
  ],
];

const probe = (thing) => yieldmap.find(([, sniff]) => sniff(thing));

const reader = (thing) => {
  const [kind, , fill] = probe(thing);
  const filled = { parts: [], ...fill(thing) };
  return {
    get kind() {
      return kind;
    },
    get condition() {
      return filled.condition;
    },
    get product() {
      return filled.product;
    },
    get parts() {
      return filled.parts;
    },
  };
};

export { reader as yield };
