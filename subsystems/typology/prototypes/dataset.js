import * as is from "../gestalten/is/index.js";

const CODECS = { json: "json", jsonc: "json", js: "data", ts: "data", mjs: "data" };

export const reader = {
  dir: (target) => ({ walk: target }),
  json: (target) => ({ read: target, codec: "json" }),
  js: (target) => ({ read: target, codec: "data" }),
  rows: (rows) => ({ rows }),
  lift: (declared) => {
    if (is.array(declared)) return { rows: declared };
    if (is.object(declared)) return declared;
    if (!is.string(declared)) throw new Error(`[reader] cannot lift ${JSON.stringify(declared)}`);
    const codec = CODECS[declared.split(".").pop().toLowerCase()];
    return codec ? { read: declared, codec } : { walk: declared };
  },
};

const descriptor = (item) =>
  is.string(item) ||
  is.array(item) ||
  (is.object(item) && ("rows" in item || "read" in item || "walk" in item));

export class Dataset {
  intent = [];
  sources = {};

  constructor(input = {}) {
    if (input instanceof Dataset) return input;
    const { schema, intent = [], entities = {}, ...declared } = input ?? {};
    this.intent = intent;
    for (const [type, sources] of Object.entries(declared))
      this.sources[type] = (is.array(sources) && sources.every(descriptor) ? sources : [sources])
        .map(reader.lift);
    for (const [type, rows] of Object.entries(entities))
      (this.sources[type] ??= []).push(reader.rows(rows));
  }

  get types() {
    return Object.keys(this.sources);
  }
}
