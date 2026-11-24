import { contexts, shard, Signal, specimen, steer, ToolCall, v, Vector } from "@vivalence/typology";
import * as harness from "/Users/finn/vivalence/code/vivalence/commons/harnesses/runtime/runtime-harness.viva.js";
import { accio } from "/Users/finn/vivalence/code/vivalence/systems/runtime/tests/scenarios/registry.js";

const { Tool } = v.primitives.hallucination;
const flat = (host) => Object.values(host.modes).flatMap((type) => Object.values(type));
export const natures = (reference) => new Signal(reference).array.map((step) => step.nature).filter(Boolean);
const absolute = (host, mode) => `${host.reference}/mode/${mode.manifest.type}/${mode.manifest.slug}`;
const within = (inner, outer) => natures(outer).every((nature, index) => natures(inner)[index] === nature);

const path = (steps) => `/${steps.join("/")}`;
export const home = (ctx) => ({ host: ctx.daemon.reference, mode: absolute(ctx.daemon, ctx.mode) });
export const narrow = (home, reference) => {
  if (within(reference, home.mode)) return path(natures(reference).slice(natures(home.mode).length));
  const [kind, slug, , ...rest] = natures(reference);
  if (within(reference, home.host)) return path(rest);
  if (kind === "runtime") return path(["runtime", ...rest]);
  return path([kind, slug, ...rest]);
};
export const readings = (ctx, reference) => {
  const [first, second, ...rest] = natures(reference);
  return [
    `${home(ctx).mode}${reference}`,
    `${home(ctx).host}/mode${reference}`,
    ...(first === "runtime" ? [`${ctx.runtime.reference}/mode${path([second, ...rest])}`] : []),
    ...(first === "daemon" ? [`/daemon/${second}/mode${path(rest)}`] : []),
    reference,
  ];
};
export const seat = (ctx, tools, entry) => {
  const steps = natures(narrow(home(ctx), entry.reference));
  if (!steps.length) return tools.graft(entry.tools);
  const parent = steps.length > 1 ? tools.branch(path(steps.slice(0, -1))) : tools;
  const seated = entry.pattern ? parent.seat(entry.pattern) : parent.branch(`/${steps.at(-1)}`);
  return seated
    .use(shard.context.spread(contexts.daemonDie, entry.host))
    .use(shard.context.bind("mode", entry.mode))
    .graft(entry.tools);
};

export const found = (ctx, reference) => {
  const hosts = [ctx.runtime, ...Object.values(ctx.runtime.daemons)];
  const held = hosts.flatMap((host) => flat(host).map((mode) => ({ home: absolute(host, mode), mode, host })));
  const matches = readings(ctx, reference).flatMap((reading) =>
    held.flatMap((entry) => {
      if (within(entry.home, reading)) return [{ host: entry.host, mode: entry.mode, reference: entry.home, tools: entry.mode.tools }];
      if (!within(reading, entry.home)) return [];
      const rest = natures(reading).slice(natures(entry.home).length);
      const edge = steer.trie.at(entry.mode.tools, rest.slice(0, -1))?.edge(rest.at(-1));
      return edge ? [{ host: entry.host, mode: entry.mode, reference: reading, pattern: edge[0], tools: edge[1] }] : [];
    }),
  );
  return [...new Map(matches.map((entry) => [entry.reference, entry])).values()];
};

const declarations = (tools) =>
  steer.trie.leaves(tools).map(({ pattern, steps }) => ({
    name: new ToolCall(steps).name,
    ...(pattern.valence && { valence: pattern.valence }),
    ...(pattern.input && { input: pattern.input }),
    ...(pattern.output && { output: pattern.output }),
  }));
const named = (reference) => new ToolCall(natures(reference).map((nature) => ({ nature }))).name;

export const tool = new Vector().open(
  {
    nature: "/tool/load",
    valence:
      "Loads tools into this thread: one tool, a mode's whole tree, or every mode a reference covers. " +
      "Each loaded tool is declared from the next round on. A wider reference loads more: start narrow.",
    input: v
      .object({ references: v.array(v.string()) })
      .eg(
        { references: ["/daemon/education/mode/tactic/harvest/drain"] },
        { references: ["/tactic/harvest", "/runtime/runtime/mode/harness/runtime/fs"] },
      ),
    output: v
      .object({ tools: v.array(Tool) })
      .eg({
        tools: [
          {
            name: "daemon_education_mode_tactic_harvest_drain",
            valence: "Writes the daemon's truth back to the dataset files.",
            input: { type: "object", properties: { topography: { type: "string" } } },
          },
        ],
      }),
  },
  async (ctx) => {
    const loaded = ctx.input.references.flatMap((reference) => found(ctx, reference));
    for (const entry of loaded) {
      seat(ctx, ctx.tools, entry);
      ctx.thread.trait.TOOLED[entry.reference] = "eager";
    }
    await ctx.entities.em.flush();
    return {
      output: {
        tools: declarations(ctx.tools).filter((held) =>
          loaded.some((entry) => held.name.startsWith(named(narrow(home(ctx), entry.reference)))),
        ),
      },
    };
  },
);

export const unload = new Vector().open(
  {
    nature: "/tool/unload",
    valence:
      "Takes tools out of this thread: one tool, a subtree or a whole mode. " +
      "They are no longer declared from the next round on; what earlier turns say about them stays.",
    input: v
      .object({ references: v.array(v.string()) })
      .eg({ references: ["/runtime/runtime/mode/harness/runtime/fs/delete"] }, { references: ["/tactic/harvest"] }),
    output: v
      .object({ unloaded: v.array(v.string()) })
      .eg({ unloaded: ["/runtime/runtime/mode/harness/runtime/fs/delete"] }),
  },
  async (ctx) => {
    const keys = () => Object.keys(ctx.thread.trait.TOOLED);
    const unloaded = [...new Set(ctx.input.references.flatMap((reference) => readings(ctx, reference)))].filter((reading) =>
      keys().some((key) => within(key, reading) || within(reading, key)),
    );
    for (const reference of unloaded) {
      ctx.tools.trim(narrow(home(ctx), reference));
      for (const key of keys()) if (within(key, reference)) delete ctx.thread.trait.TOOLED[key];
      if (keys().some((key) => within(reference, key))) ctx.thread.trait.TOOLED[reference] = "none";
    }
    await ctx.entities.em.flush();
    return { output: { unloaded } };
  },
);

export { declarations, named };
