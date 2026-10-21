import * as is from "../is/scalars.js";
import * as steer from "../steer/index.js";
import { fire } from "../steer/strategy.js";
import { Vector } from "../../prototypes/vector.js";

const joined = (prefix, steps) => [prefix, ...steps.map((step) => step.nature)].filter(Boolean).join("/");

const loading = (steps, inherited) => steps.findLast((step) => step.load)?.load ?? inherited;

const nodes = (primer, prefix = "", inherited = "eager") =>
  steer.trie.rollup(primer, (carry, effect) => effect).flatMap(({ pattern, steps, fn }) => {
    const node = { nature: joined(prefix, steps), valence: pattern.valence, load: loading(steps, inherited), effect: fn };
    return fn instanceof Vector ? nodes(fn, node.nature, node.load) : [node];
  });

const BODIES = [
  [(value) => value === null, "absent"],
  [(value) => is.string(value), "text"],
  [(value) => value instanceof Vector, "primer"],
];

const body = async (node, ctx) => {
  const value = is.fn(node.effect) ? await fire(node.effect, ctx) : node.effect;
  const found = BODIES.find(([test]) => test(value));
  if (!found) throw new Error(`[primer] '${node.nature}' gave ${typeof value}; an effect gives a string, null or a Vector`);
  return { kind: found[1], value };
};

const listing = (lazy) => lazy.map((node) => `${node.nature}${node.valence ? ` — ${node.valence}` : ""}`).join("\n");

export const lazy = (primer) => nodes(primer).filter((node) => node.load === "lazy");

export const keys = (primer) => nodes(primer).filter((node) => node.load === "eager").map((node) => node.nature);

const LOADS = {
  absent: () => {},
  text: (node, value, ctx, record) => {
    record.sections[node.nature] = value;
  },
  primer: (node, value, ctx, record) => gather(value, ctx, node.nature, node.load, record),
};

const gather = async (primer, ctx, prefix, inherited, record) => {
  for (const node of nodes(primer, prefix, inherited)) {
    if (node.load === "lazy") {
      if (!record.lazy.length) record.sections.primer = null;
      record.lazy.push(node);
      continue;
    }
    const { kind, value } = await body(node, ctx);
    await LOADS[kind](node, value, ctx, record);
  }
};

export async function load(primer, ctx = {}) {
  const record = { sections: {}, lazy: [] };
  await gather(primer, ctx, "", "eager", record);
  if (record.lazy.length) record.sections.primer = `Read on demand with primer_read { nature }:\n${listing(record.lazy)}`;
  return record.sections;
}

const absent = (nature) => {
  throw new Error(`[primer] no node at '${nature}'`);
};

const READS = {
  absent: (wanted) => absent(wanted),
  text: (wanted, node, value, rest) => (rest ? absent(wanted) : value),
  primer: (wanted, node, value, rest, ctx, prefix) => (rest ? read(value, rest, ctx, joined(prefix, [node])) : listing(nodes(value, joined(prefix, [node])))),
};

export async function read(primer, nature, ctx = {}, prefix = "") {
  const wanted = nature.replace(/^\/+/, "");
  const all = nodes(primer);
  const node = all.find((node) => node.nature === wanted) ?? all.find((node) => wanted.startsWith(`${node.nature}/`));
  if (!node) absent(joined(prefix, [{ nature: wanted }]));
  const { kind, value } = await body(node, ctx);
  return await READS[kind](joined(prefix, [{ nature: wanted }]), node, value, wanted.slice(node.nature.length + 1), ctx, prefix);
}
