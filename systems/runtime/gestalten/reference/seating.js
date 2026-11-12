import { contexts, shard } from "@vivalence/typology";
import { narrow, natures } from "./reading.js";

const OWNED = [
  [
    (entry) => "daemon" in entry,
    (entry) => [shard.context.spread(contexts.daemonDie, entry.daemon), shard.context.bind("daemon", entry.daemon)],
  ],
  [
    () => true,
    (entry) => [shard.context.spread(contexts.runtimeDie, entry.runtime), shard.context.bind("runtime", entry.runtime)],
  ],
];

export const seat = (ctx, tools, entry) => {
  const steps = natures(narrow(ctx, entry.reference));
  if (!steps.length) return tools.graft(entry.vector);
  const parent = tools.branch(steps.slice(0, -1));
  const seated = entry.pattern ? parent.seat(entry.pattern) : parent.branch(`/${steps.at(-1)}`);
  for (const tap of OWNED.find(([test]) => test(entry))[1](entry)) seated.use(tap);
  return seated.use(shard.context.bind("mode", entry.mode)).graft(entry.vector);
};

export const section = (ctx, primer, entry, load) => {
  const steps = natures(narrow(ctx, entry.reference));
  if (entry.pattern) {
    const parent = primer.branch(steps.slice(0, -1));
    return parent.seat({ ...entry.pattern, load }).graft(entry.vector);
  }
  const parent = primer.branch(steps);
  for (const [pattern, trajectory] of entry.vector.trie) parent.seat({ ...pattern, load }).graft(trajectory);
  return parent;
};
