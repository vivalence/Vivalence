import { belt, soma } from "@vivalence/typology";

export const stream = async (mode, terminal, parts) => {
  let turn = null;
  for await (const packet of mode.harness.dialogue.stream({ thread: terminal.thread.id, terminal: terminal.id, turn: crypto.randomUUID(), parts })) {
    turn = soma.pour(turn, packet);
    await terminal.client.runtime.entities.turn.merge({ ...turn, thread: terminal.thread.id, mode: mode.id });
  }
};

const UNSERVED = { home: null, TOOLED: [], PRIMED: [] };

export const mounted = (thread) =>
  thread !== null && thread.mode !== null && thread.mode.implements("HARNESSED") && "harness" in thread.mode.metadata;

export const served = (thread) => {
  if (!mounted(thread)) return UNSERVED;
  const { home, index } = thread.mode.metadata.harness;
  const { slugging } = thread.trait.HARNESSED;
  return {
    home,
    TOOLED: belt.reference.fold(thread.trait.TOOLED, home, index.TOOLED, slugging),
    PRIMED: belt.reference.fold(thread.trait.PRIMED, home, index.PRIMED, slugging),
  };
};

export const tallied = (thread) => {
  const map = served(thread);
  const { eager, lazy } = belt.reference.tally([...map.TOOLED, ...map.PRIMED]);
  return { eager, lazy };
};

export const MARKS = { eager: "●", lazy: "○", none: "×" };

export const counted = (entries) => `${belt.reference.tally(entries).eager}/${entries.length}`;

export const acts = (entry, live = entry.state !== "none") => [
  ...(entry.state === "eager" ? [] : ["load"]),
  ...(entry.state === "none" ? ["preload"] : []),
  ...(live ? ["unload"] : []),
];

const TRAITS = [
  [(nature) => belt.reference.within(nature, "/tool"), "TOOLED"],
  [(nature) => belt.reference.within(nature, "/primer"), "PRIMED"],
];

const traitOf = (nature) => TRAITS.find(([test]) => test(nature))[1];

export const indexed = (thread, nature) =>
  served(thread)[traitOf(nature)].map((entry) => entry.reference);

const VERBS = {
  "/tool/load": (delta, home, reference) => belt.reference.loaded(delta, reference),
  "/tool/preload": (delta, home, reference) => belt.reference.preloaded(delta, home, reference),
  "/tool/unload": (delta, home, reference) => belt.reference.unloaded(delta, home, reference),
  "/tool/reset": (delta, home, reference) => belt.reference.reset(delta, reference),
  "/primer/load": (delta, home, reference) => belt.reference.loaded(delta, reference),
  "/primer/preload": (delta, home, reference) => belt.reference.preloaded(delta, home, reference),
  "/primer/unload": (delta, home, reference) => belt.reference.unloaded(delta, home, reference),
  "/primer/reset": (delta, home, reference) => belt.reference.reset(delta, reference),
};

const applied = (thread, nature, references) =>
  references.reduce(
    (delta, reference) => VERBS[nature](delta, thread.mode.metadata.harness.home, reference),
    thread.trait[traitOf(nature)],
  );

export const unchanged = (thread, nature, references) =>
  belt.object.equals(applied(thread, nature, references), thread.trait[traitOf(nature)]);

export const previewed = (thread, nature, references) => {
  const trait = traitOf(nature);
  const map = served(thread);
  if (map.home === null) return [];
  const after = belt.reference.fold(
    applied(thread, nature, references),
    map.home,
    thread.mode.metadata.harness.index[trait],
    thread.trait.HARNESSED.slugging,
  );
  return belt.reference.changes(map[trait], after);
};
