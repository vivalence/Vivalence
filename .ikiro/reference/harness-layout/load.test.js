import { contexts, shard, Signal, specimen, steer, ToolCall, v, Vector } from "@vivalence/typology";
import * as harness from "../../../commons/harnesses/runtime/runtime-harness.viva.js";
import { accio } from "../../../systems/runtime/tests/scenarios/registry.js";

const { Tool } = v.primitives.hallucination;
const flat = (modes) => Object.values(modes).flatMap((type) => Object.values(type));
export const natures = (reference) => new Signal(reference).array.map((step) => step.nature).filter(Boolean);
const absolute = (reference, mode) => `${reference}/mode/${mode.manifest.type}/${mode.manifest.slug}`;
const within = (inner, outer) => natures(outer).every((nature, index) => natures(inner)[index] === nature);

const path = (steps) => `/${steps.join("/")}`;
const located = (ctx) => absolute(ctx.reference, ctx.mode);

export const narrow = (ctx, reference) => {
  if (within(reference, located(ctx))) return path(natures(reference).slice(natures(located(ctx)).length));
  const [kind, slug, , ...rest] = natures(reference);
  if (within(reference, ctx.reference)) return path(rest);
  if (kind === "runtime") return path(["runtime", ...rest]);
  return path([kind, slug, ...rest]);
};
export const readings = (ctx, reference) => {
  const [first, second, ...rest] = natures(reference);
  return [
    `${located(ctx)}${reference}`,
    `${ctx.reference}/mode${reference}`,
    ...(first === "runtime" ? [`${ctx.runtime.reference}/mode${path([second, ...rest])}`] : []),
    ...(first === "daemon" ? [`/daemon/${second}/mode${path(rest)}`] : []),
    reference,
  ];
};

const OWNED = [
  [(entry) => "daemon" in entry, (entry) => [shard.context.spread(contexts.daemonDie, entry.daemon), shard.context.bind("daemon", entry.daemon)]],
  [() => true, (entry) => [shard.context.spread(contexts.runtimeDie, entry.runtime), shard.context.bind("runtime", entry.runtime)]],
];

export const seat = (ctx, tools, entry) => {
  const steps = natures(narrow(ctx, entry.reference));
  if (!steps.length) return tools.graft(entry.vector);
  const parent = steps.length > 1 ? tools.branch(path(steps.slice(0, -1))) : tools;
  const seated = entry.pattern ? parent.seat(entry.pattern) : parent.branch(`/${steps.at(-1)}`);
  for (const tap of OWNED.find(([test]) => test(entry))[1](entry)) seated.use(tap);
  return seated.use(shard.context.bind("mode", entry.mode)).graft(entry.vector);
};

export const section = (ctx, primer, entry, load) => {
  const steps = natures(narrow(ctx, entry.reference));
  if (entry.pattern) {
    const parent = steps.length > 1 ? primer.branch(path(steps.slice(0, -1))) : primer;
    return parent.seat({ ...entry.pattern, load }).graft(entry.vector);
  }
  const parent = steps.length ? primer.branch(path(steps)) : primer;
  for (const [pattern, trajectory] of entry.vector.trie) parent.seat({ ...pattern, load }).graft(trajectory);
  return parent;
};

export const modes = (ctx) => [
  ...flat(ctx.runtime.modes).map((mode) => ({ mode, runtime: ctx.runtime, reference: absolute(ctx.runtime.reference, mode) })),
  ...Object.values(ctx.runtime.daemons).flatMap((daemon) =>
    flat(daemon.modes).map((mode) => ({ mode, daemon, reference: absolute(daemon.reference, mode) })),
  ),
];

export const covered = (ctx, reference) =>
  modes(ctx).filter((entry) => readings(ctx, reference).some((reading) => within(entry.reference, reading)));

const reached = (ctx, reading, tree) =>
  modes(ctx)
    .filter((entry) => tree(entry.mode))
    .flatMap((entry) => {
      if (within(entry.reference, reading)) return [{ ...entry, vector: tree(entry.mode) }];
      if (!within(reading, entry.reference)) return [];
      const rest = natures(reading).slice(natures(entry.reference).length);
      const edge = steer.trie.at(tree(entry.mode), rest.slice(0, -1))?.edge(rest.at(-1));
      return edge ? [{ ...entry, reference: reading, pattern: edge[0], vector: edge[1] }] : [];
    });

export const found = (ctx, reference, tree = (mode) => mode.tools) => {
  const matches = readings(ctx, reference).flatMap((reading) => reached(ctx, reading, tree));
  const named = Map.groupBy(matches, (entry) => narrow(ctx, entry.reference));
  // for (const [name, held] of named) if (new Set(held.map((entry) => entry.reference)).size > 1) console.log(name, "shadows", held.map((entry) => entry.reference));
  return [...named.values()].map((held) => held[0]);
};

export const keyed = (ctx, reference, tree = (mode) => mode.tools) => {
  const kept = found(ctx, reference, tree).map((entry) => entry.reference);
  const hits = readings(ctx, reference).filter((reading) =>
    reached(ctx, reading, tree).some((entry) => kept.includes(entry.reference)),
  );
  return hits.filter((reading) => !hits.some((other) => other !== reading && within(reading, other)));
};

export const missed = (ctx, references, tree = (mode) => mode.tools) =>
  references.filter((reference) => !found(ctx, reference, tree).length);

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
      .object({ tools: v.array(Tool), missed: v.array(v.string()) })
      .eg({
        missed: [],
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
    for (const entry of loaded) seat(ctx, ctx.tools, entry);
    for (const reference of ctx.input.references)
      for (const key of keyed(ctx, reference)) ctx.thread.trait.TOOLED[key] = "eager";
    await ctx.entities.em.flush();
    return {
      output: {
        tools: declarations(ctx.tools).filter((held) =>
          loaded.some((entry) => held.name.startsWith(named(narrow(ctx, entry.reference)))),
        ),
        missed: missed(ctx, ctx.input.references),
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
      .object({ unloaded: v.array(v.string()), missed: v.array(v.string()) })
      .eg({ unloaded: ["/runtime/runtime/mode/harness/runtime/fs/delete"], missed: [] }),
  },
  async (ctx) => {
    const keys = () => Object.keys(ctx.thread.trait.TOOLED);
    const held = (reading) => keys().some((key) => within(key, reading) || within(reading, key));
    const unloaded = [...new Set(ctx.input.references.flatMap((reference) => keyed(ctx, reference)))].filter(held);
    const absent = ctx.input.references.filter((reference) => !keyed(ctx, reference).some(held));
    for (const reference of unloaded) {
      ctx.tools.trim(narrow(ctx, reference));
      for (const key of keys()) if (within(key, reference)) delete ctx.thread.trait.TOOLED[key];
      if (keys().some((key) => within(reference, key))) ctx.thread.trait.TOOLED[reference] = "none";
    }
    await ctx.entities.em.flush();
    return { output: { unloaded, missed: absent } };
  },
);

specimen.describe("tool/load", () => {
  specimen.it("references, read three ways, grafted under their absolute reference", async () => {
    const harvest = await accio("@education/tactic/harvest");
    const francesca = { manifest: { type: "teacher", slug: "francesca" }, tools: new Vector() };
    const education = { reference: "/daemon/education", modes: { tactic: { harvest }, teacher: { francesca } } };
    const runtime = {
      reference: "/runtime/runtime",
      modes: { harness: { runtime: { manifest: harness.manifest, tools: harness.tools } } },
      daemons: { education },
    };
    const thread = { trait: { TOOLED: {} } };
    const flushed = [];
    const tools = new Vector().graft(tool, unload);
    tools
      .use(shard.context.bind("tools", tools))
      .use(shard.context.bind("runtime", runtime))
      .use(shard.context.bind("daemon", education))
      .use(shard.context.bind("reference", education.reference))
      .use(shard.context.bind("mode", francesca))
      .use(shard.context.bind("thread", thread))
      .use(shard.context.bind("entities", { em: { flush: async () => flushed.push("flush") } }));
    const input = { references: ["/tactic/harvest/drain", `/runtime/runtime/mode/${harness.manifest.type}/${harness.manifest.slug}/fs`] };
    const result = await steer.dispatch.invoke(tools, new ToolCall("tool_load"), steer.strategy.guarded)(input);
    const names = () => declarations(tools).map((held) => `declared ${held.name}`);
    const out = ["", `tool_load ${JSON.stringify(input)}`, ...names(), JSON.stringify(thread.trait, null, 2)];
    for (const gone of [{ references: ["/runtime/runtime/mode/harness/runtime/fs/delete"] }, { references: ["/tactic/harvest/drain"] }]) {
      const answer = await steer.dispatch.invoke(tools, new ToolCall("tool_unload"), steer.strategy.guarded)(gone);
      out.push(`tool_unload ${JSON.stringify(gone)}`, `answer ${JSON.stringify(answer.output)}`, ...names(), JSON.stringify(thread.trait, null, 2));
    }
    out.push(`flushed ${flushed.length}`, `result keys ${Object.keys(result.output)}`);
    console.log(out.join("\n"));
    specimen.expect(thread.trait.TOOLED).toEqual({
      "/runtime/runtime/mode/harness/runtime/fs": "eager",
      "/runtime/runtime/mode/harness/runtime/fs/delete": "none",
    });
    specimen.expect(names().includes("declared runtime_harness_runtime_fs_delete")).toBe(false);
    specimen.expect(names().includes("declared tactic_harvest_drain")).toBe(false);
    specimen.expect(names().includes("declared runtime_harness_runtime_fs_read")).toBe(true);
  });
});
