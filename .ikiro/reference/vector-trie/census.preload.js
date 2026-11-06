import { Vector } from "@vivalence/typology";

const OUT = Deno.env.get("CENSUS_OUT");
const CHAIN = ["nature", "type", "filter", "heir", "trace", "gauges"];

const declared = (pattern) =>
  Object.keys(pattern)
    .filter((key) => !CHAIN.includes(key) && pattern[key] !== undefined)
    .sort();

const caller = () =>
  new Error().stack
    .split("\n")
    .slice(2)
    .map((frame) => frame.trim().replace(/^at /, ""))
    .find((frame) => !frame.includes("census.preload.js") && !frame.includes("prototypes/vector.js"))
    ?.replace(/^.*vivalence\/code\/vivalence\//, "")
    .replace(/\)$/, "");

const record = (entry) =>
  Deno.writeTextFileSync(OUT, JSON.stringify({ ...entry, at: caller() }) + "\n", { append: true });

const keyOf = (vector, nature) => {
  if (!vector.edge) return vector.trie.get(nature)?.pattern;
  return vector.edge(nature)?.[0];
};

const keys = (vector) =>
  vector.edge
    ? [...vector.trie.keys()].map((pattern) => [pattern.nature, pattern])
    : [...vector.trie].map(([nature, edge]) => [nature, edge.pattern]);

const weight = (keys) => (keys.length ? "rich" : "bare");

const branch = Vector.prototype.branch;
Vector.prototype.branch = function (signature, vector) {
  const pattern = new this.signature(signature);
  const existing = pattern.nature == null ? undefined : keyOf(this, pattern.nature);
  if (existing) {
    const before = declared(existing);
    const after = declared(pattern);
    record({
      via: "branch",
      class: `${weight(before)} → ${weight(after)}`,
      nature: pattern.nature,
      before,
      after,
      same: existing === pattern,
    });
  }
  return branch.call(this, signature, vector);
};

Vector.prototype.open = function (signature, effect) {
  const tip = this.branch(signature);
  if (tip.effect && tip.effect !== effect)
    record({ via: "open", class: "effect over effect", nature: String(signature?.nature ?? signature) });
  tip.effect = effect;
  return this;
};

const affect = Vector.prototype.do;
Vector.prototype.do = function (effect) {
  if (this.effect && this.effect !== effect) record({ via: "do", class: "effect over effect", nature: "(node)" });
  return affect.call(this, effect);
};

const graft = Vector.prototype.graft;
Vector.prototype.graft = function (...vectors) {
  for (const vector of vectors) {
    if (vector === this) continue;
    if (vector.effect && this.effect && vector.effect !== this.effect)
      record({ via: "graft", class: "effect over effect", nature: "(node)" });
    for (const [nature, incoming] of keys(vector)) {
      const existing = keyOf(this, nature);
      if (!existing) continue;
      const before = declared(existing);
      const after = declared(incoming);
      record({
        via: "graft",
        class: `${weight(before)} → ${weight(after)}`,
        nature,
        before,
        after,
        same: existing === incoming,
      });
    }
  }
  return graft.apply(this, vectors);
};
