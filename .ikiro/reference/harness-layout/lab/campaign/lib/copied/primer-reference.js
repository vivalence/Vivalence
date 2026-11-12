import { shard, shape, Signal, specimen, steer, ToolCall, v, Vector } from "@vivalence/typology";
import { accio } from "/Users/finn/vivalence/code/vivalence/systems/runtime/tests/scenarios/registry.js";

const flat = (host) => Object.values(host.modes).flatMap((type) => Object.values(type));
const natures = (reference) => new Signal(reference).array.map((step) => step.nature);
const absolute = (host, mode) => `${host.reference}/mode/${mode.manifest.type}/${mode.manifest.slug}`;
const within = (inner, outer) => natures(outer).every((nature, index) => natures(inner)[index] === nature);
const readings = (ctx, reference) => [
  reference,
  `${ctx.daemon.reference}/mode${reference}`,
  `${absolute(ctx.daemon, ctx.mode)}${reference}`,
];
const sections = (primer) => [...shape.primer.keys(primer), ...shape.primer.lazy(primer).map((node) => node.nature)];

const found = (ctx, reference) => {
  const hosts = [ctx.runtime, ...Object.values(ctx.runtime.daemons)];
  const held = hosts.flatMap((host) =>
    flat(host).flatMap((mode) =>
      sections(mode.primer).map((nature) => ({ mode, nature, reference: `${absolute(host, mode)}/${nature}` })),
    ),
  );
  return held.filter((entry) => readings(ctx, reference).some((reading) => within(entry.reference, reading)));
};

const primer = new Vector().open(
  {
    nature: "/primer/load",
    valence:
      "Loads primer sections into this thread in full: one section, or every section a reference covers. " +
      "Each stays in the system prompt from the next request on. A wider reference loads more: start narrow.",
    input: v
      .object({ references: v.array(v.string()) })
      .eg(
        { references: ["/daemon/education/mode/tactic/harvest/archivist"] },
        { references: ["/tactic/harvest"] },
      ),
    output: v
      .object({ primers: v.array(v.object({ reference: v.string(), text: v.string() })) })
      .eg({ primers: [{ reference: "/daemon/education/mode/tactic/harvest/archivist", text: "You are the archivist." }] }),
  },
  async (ctx) => {
    const primers = [];
    for (const entry of ctx.input.references.flatMap((reference) => found(ctx, reference))) {
      const text = await shape.primer.read(entry.mode.primer, entry.nature, { ...ctx, mode: entry.mode });
      ctx.thread.trait.PRIMED[entry.reference] = "eager";
      primers.push({ reference: entry.reference, text });
    }
    await ctx.entities.em.flush();
    return { output: { primers } };
  },
);

export { primer,found as primerFound,readings as primerReadings };
