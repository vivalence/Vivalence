import * as is from "../gestalten/is/index.js";
import * as object from "../gestalten/belt/object.js";
import * as query from "../gestalten/belt/query.js";

const bySlug = (a, b) => {
  const first = String(a?.slug ?? "");
  const second = String(b?.slug ?? "");
  return first < second ? -1 : first > second ? 1 : 0;
};

const ref = (item) => {
  if (is.string(item)) return { slug: item };
  if (!is.object(item) || !item.slug) return null;
  const out = { slug: item.slug };
  if (item.traits?.length) out.traits = [...item.traits];
  if (item.trait && Object.keys(item.trait).length) out.trait = item.trait;
  if (item.data && Object.keys(item.data).length) out.data = item.data;
  return out;
};

export const project = {
  row: (relations = [], keep = null) => (entity) => {
    const raw = entity?.toJSON?.() ?? entity ?? {};
    const out = keep ? object.pick(raw, keep) : { ...raw };
    for (const relation of relations)
      out[relation] = [raw[relation] ?? []].flat().map(ref).filter(Boolean).sort(bySlug);
    return out;
  },
  lean: (relations = []) => (row) => {
    const out = { ...row };
    for (const relation of relations)
      if (is.array(out[relation])) out[relation] = out[relation].map((item) => ({ slug: item.slug }));
    return out;
  },
  refs: (relation, policies = []) => {
    const compiled = policies.map(([selector, shape]) => [query.where(selector), shape]);
    return (row) => ({
      ...row,
      [relation]: (row[relation] ?? [])
        .flatMap((item) => {
          const policy = compiled.find(([match]) => match?.(item) ?? true);
          if (!policy) return [item];
          const shaped = policy[1](item);
          return shaped == null ? [] : [shaped];
        })
        .sort(bySlug),
    });
  },
  slug: (item) => ({ slug: item.slug }),
  detail: (...names) => (item) => ({
    slug: item.slug,
    ...(names.length ? { trait: object.pick(item.trait ?? item.data ?? {}, names) } : {}),
  }),
  traits: (...names) => (row) => ({
    ...row,
    traits: (row.traits ?? []).filter((name) => names.includes(name)),
    ...(row.trait ? { trait: object.pick(row.trait, names) } : {}),
  }),
  pick: (...keys) => (row) => object.pick(row, keys),
  omit: (...keys) => (row) => object.omit(row, keys),
  drop: () => null,
  pipe: (...shapes) => (row) => shapes.reduce((acc, shape) => (acc == null ? acc : shape(acc)), row),
};

const AUTHORED = ["slug", "traits", "trait"];

const empty = (value) =>
  value == null ||
  value === "" ||
  (is.array(value) && value.length === 0) ||
  (is.object(value) && Object.keys(value).length === 0);

const sparse = (row) => Object.fromEntries(Object.entries(row).filter(([, value]) => !empty(value)));

const glob = (pattern) =>
  new RegExp(
    "^" +
      String(pattern)
        .split("%")
        .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join("(.*)") +
      "$",
  );

export const codec = {
  json: (rows) => JSON.stringify(rows, null, 2) + "\n",
  js: (rows) => `export default ${JSON.stringify(rows, null, 2)};\n`,
  jsonl: (rows) => rows.map((row) => JSON.stringify(row)).join("\n") + "\n",
};

const EXTENSIONS = { json: "json", jsonc: "json", jsonl: "jsonl", js: "js", mjs: "js", ts: "js" };

export const writer = {
  json: (target, keep) => writer.lift(target, keep, "json"),
  js: (target, keep) => writer.lift(target, keep, "js"),
  jsonl: (target, keep) => writer.lift(target, keep, "jsonl"),
  split: (pattern, target, keep) => ({ ...writer.lift(target, keep), split: pattern }),
  lift: (declared, keep, named) => {
    if (is.object(declared)) return { keep: AUTHORED, codec: "json", ...declared };
    if (!is.string(declared)) throw new Error(`[writer] cannot lift ${JSON.stringify(declared)}`);
    const inferred = named ?? EXTENSIONS[declared.split(".").pop().toLowerCase()];
    if (!inferred) throw new Error(`[writer] no codec for "${declared}" — name one, or register it on writer.codec`);
    return { write: declared, codec: inferred, keep: keep ?? AUTHORED };
  },
  authored: AUTHORED,
  codec,
};

export class Datasink {
  sinks = [];

  constructor(input = {}) {
    if (input instanceof Datasink) return input;
    for (const [type, tuples] of Object.entries(input ?? {}))
      for (const [selector, second, third] of tuples) {
        const [shape, target] = third === undefined ? [null, second] : [second, third];
        this.sinks.push({
          type,
          where: query.lift(selector),
          match: query.where(selector),
          shape,
          target: writer.lift(target),
        });
      }

    const claimed = new Set();
    for (const target of this.targets) {
      if (claimed.has(target)) throw new Error(`[Datasink] two sinks write "${target}"`);
      claimed.add(target);
    }
  }

  get types() {
    return [...new Set(this.sinks.map((sink) => sink.type))];
  }

  get targets() {
    return this.sinks
      .map((sink) => sink.target)
      .filter((target) => !target.split)
      .map((target) => target.write);
  }

  of(type) {
    return this.sinks.filter((sink) => sink.type === type);
  }

  concerns(type, row, ctx) {
    return this.of(type).filter((sink) => sink.match?.(row, ctx) ?? true);
  }

  static canonical(rows, named = "json") {
    const encode = codec[named];
    if (!encode) throw new Error(`[Datasink] unknown codec "${named}" — register one on writer.codec`);
    return encode([...rows].sort(bySlug).map(sparse).map(object.ordered));
  }

  static captures(row, pattern) {
    const bound = new Set();
    for (const value of Object.values(row ?? {})) {
      if (!is.array(value)) continue;
      for (const item of value) {
        const slug = is.string(item) ? item : item?.slug;
        const hit = is.string(slug) ? slug.match(pattern) : null;
        if (hit) bound.add(hit[1]);
      }
    }
    return [...bound].sort();
  }

  static strata(rows, target) {
    if (!target.split) return new Map([[target.write, rows]]);
    const pattern = glob(target.split);
    const strata = new Map();
    for (const row of rows)
      for (const capture of Datasink.captures(row, pattern)) {
        const path = target.write.replace("%", capture);
        (strata.get(path) ?? strata.set(path, []).get(path)).push(row);
      }
    return strata;
  }
}
