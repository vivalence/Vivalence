import { Signal } from "../../prototypes/signal.js";
import * as object from "./object.js";

export const natures = (reference) => new Signal(reference).absolute;

export const within = (inner, outer) => {
  const steps = natures(inner);
  return natures(outer).every((nature, index) => steps[index] === nature);
};

const SLUGGING = {
  deep: (home, reference) => within(reference, home),
  nested: () => false,
};

export const narrow = (home, reference, slugging) => {
  const owner = new Signal(natures(home).slice(0, 2));
  if (SLUGGING[slugging](home, reference)) return new Signal(natures(reference).slice(natures(home).length)).pathname;
  const [kind, slug, , ...rest] = natures(reference);
  if (within(reference, owner)) return new Signal(rest).pathname;
  if (kind === "runtime") return new Signal(["runtime", ...rest]).pathname;
  return new Signal([kind, slug, ...rest]).pathname;
};

export const covering = (delta, reference) =>
  Object.keys(delta)
    .filter((key) => within(reference, key))
    .sort((a, b) => natures(b).length - natures(a).length)[0];

export const offered = (home, entry) => (within(entry.reference, home) ? entry.load : "none");

export const resolved = (delta, home, entry) => {
  const key = covering(delta, entry.reference);
  return key === undefined ? offered(home, entry) : delta[key];
};

export const fold = (delta, home, entries, slugging) =>
  entries.map((entry) => ({
    ...entry,
    state: resolved(delta, home, entry),
    key: covering(delta, entry.reference) ?? null,
    offered: offered(home, entry),
    name: narrow(home, entry.reference, slugging),
  }));

export const tally = (folded) =>
  folded.reduce((counts, entry) => ({ ...counts, [entry.state]: counts[entry.state] + 1 }), {
    eager: 0,
    lazy: 0,
    none: 0,
  });

export const changes = (before, after) =>
  after
    .map((entry, index) => ({ reference: entry.reference, before: before[index].state, after: entry.state }))
    .filter((change) => change.before !== change.after);

export const loaded = (delta, key) => ({ ...delta, [key]: "eager" });

export const preloaded = (delta, home, key) =>
  resolved(delta, home, { reference: key, load: "eager" }) === "eager" ? delta : { ...delta, [key]: "lazy" };

const carries = (delta, home, key) =>
  resolved(delta, home, { reference: key, load: "eager" }) !== "none" || within(home, key);

export const reset = (delta, key) => object.filter(delta, (held) => held !== key);

export const unloaded = (delta, home, key) => {
  const kept = object.filter(delta, (held) => !within(held, key));
  return carries(kept, home, key) ? { ...kept, [key]: "none" } : kept;
};
