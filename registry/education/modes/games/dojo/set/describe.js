import * as types from "../types.js";

const tail = (slug) => String(slug).split(".").pop();

const lower = (name) => String(name).toLowerCase();

const buckets = (spec, keys, shape) => {
  if (!spec) return [];
  if (Array.isArray(spec)) return spec.length ? [spec.map(shape).join(" & ")] : [];
  return [
    spec[keys[0]]?.length && spec[keys[0]].map(shape).join(" & "),
    spec[keys[1]]?.length && spec[keys[1]].map(shape).join(" | "),
    spec[keys[2]]?.length && `− ${spec[keys[2]].map(shape).join(" | ")}`,
  ].filter(Boolean);
};

const PICK_LABEL = {
  all: "all",
  feed: "feed",
  due: "due",
  novel: "novel",
  byStrength: "by strength",
  byLastSignal: "last signal",
  sample: "sample",
};

export const label = (pick) => PICK_LABEL[pick] ?? pick;

export const describe = (clause) => {
  if (!clause) return "";
  if (clause.pick === "literals") return `picked · ${clause.literals?.length ?? 0}`;
  if (clause.pick === "authored") return `authored · ${clause.knowables?.length ?? 0}`;
  const where = clause.where ?? {};
  const qualifier =
    clause.pick === "byLastSignal"
      ? (clause.signals?.length ? clause.signals : types.MISSED).map(lower).join("|")
      : clause.pick === "sample" && clause.status?.length
        ? clause.status.map(lower).join("|")
        : null;
  return [
    [label(clause.pick), qualifier, clause.limit].filter(Boolean).join(" "),
    ...buckets(where.symbols, ["$all", "$in", "$none"], tail),
    ...buckets(where.traits, ["$contains", "$overlap", "$none"], lower),
    where.ontology && [].concat(where.ontology).join("|"),
    where.search && `"${where.search}"`,
    where.rank?.$gte && `rank ≥ ${where.rank.$gte}`,
    where.rank?.$lte && `rank ≤ ${where.rank.$lte}`,
  ]
    .filter(Boolean)
    .join(" · ");
};
