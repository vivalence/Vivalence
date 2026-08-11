import { is } from "@vivalence/typology";

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

const wrap = (thing) => {
  if (thing.output) return { condition: thing.condition ?? "NOMINAL", output: thing.output };
  const output = Object.fromEntries(
    Object.entries(thing).filter(([key]) => key !== "condition" && key !== "kind"),
  );
  return { condition: thing.condition ?? "NOMINAL", output };
};

const yieldmap = [
  [
    "response",
    (thing) => is.string(thing?.condition) && is.array(thing?.turns),
    (thing) => ({ condition: thing.condition, output: thing.output ?? {} }),
  ],
  [
    "emission",
    (thing) => is.yieldish(thing),
    (thing) => ({ condition: thing.condition, output: thing.output }),
  ],
  [
    "turn",
    (thing) => is.string(thing?.role) && is.array(thing?.parts),
    (thing) => ({
      condition: ["error", "abort", "filter"].includes(thing.meta?.state) ? "ERROR" : "NOMINAL",
      output: bag({
        message: text(thing.parts),
        object: thing.object ?? thing.parts.find((part) => part.type === "object")?.data ?? null,
      }),
    }),
  ],
  [
    "result",
    (thing) => thing?.type === "tool_result",
    (thing) => ({
      condition: thing.output?.message?.error ? "ERROR" : "NOMINAL",
      output: thing.output ?? {},
    }),
  ],
  [
    "utterance",
    (thing) => is.string(thing),
    (thing) => ({ condition: "NOMINAL", output: { message: thing } }),
  ],
  [
    "spoken",
    (thing) =>
      is.object(thing) &&
      ("output" in thing || "condition" in thing || "message" in thing || "object" in thing),
    wrap,
  ],
  [
    "opaque",
    () => true,
    (thing) => ({ condition: "NOMINAL", output: thing == null ? {} : { object: thing } }),
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
    get output() {
      return filled.output;
    },
  };
};

export { reader as yield };
