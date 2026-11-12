import { belt, shape, v, Vector } from "@vivalence/typology";
import { found, home, keyed, missed, outline, section, within } from "../reference/index.js";

const sections = (mode) => mode.primer;

export const primer = new Vector().open(
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
      .object({ primers: v.record(v.string(), v.string()), missed: v.array(v.string()) })
      .eg({
        primers: { "tactic/harvest/archivist": "# the archivist\n\nYou are the harvest operator's counterpart." },
        missed: [],
      }),
  },
  async (ctx) => {
    const loaded = new Vector();
    for (const reference of ctx.input.references)
      for (const entry of found(ctx, reference, sections)) section(ctx, loaded, entry, "eager");
    const keys = ctx.input.references.flatMap((reference) => keyed(ctx, reference, sections));
    ctx.thread.trait.PRIMED = keys.reduce(belt.reference.loaded, ctx.thread.trait.PRIMED);
    await ctx.entities.em.flush();
    return {
      output: {
        primers: await shape.primer.load(loaded, ctx),
        missed: missed(ctx, ctx.input.references, sections),
      },
    };
  },
).open(
  {
    nature: "/primer/preload",
    valence:
      "Keeps primer sections listed in this thread without loading them: each is named in the system prompt " +
      "with one sentence from the next request on; primer_load reads it in full. A wider reference lists more.",
    input: v
      .object({ references: v.array(v.string()) })
      .eg({ references: ["/runtime/runtime/mode/harness/runtime/entity"] }, { references: ["/tactic/harvest"] }),
    output: v
      .object({
        primers: v.array(v.object({ reference: v.string(), valence: v.string().optional() })),
        missed: v.array(v.string()),
      })
      .eg({
        primers: [{ reference: "/runtime/runtime/mode/harness/runtime/entity/thread", valence: "one conversation" }],
        missed: [],
      }),
  },
  async (ctx) => {
    const listed = ctx.input.references.flatMap((reference) => found(ctx, reference, sections));
    const keys = ctx.input.references.flatMap((reference) => keyed(ctx, reference, sections));
    ctx.thread.trait.PRIMED = keys.reduce(
      (delta, key) => belt.reference.preloaded(delta, home(ctx), key),
      ctx.thread.trait.PRIMED,
    );
    await ctx.entities.em.flush();
    return {
      output: { primers: listed.flatMap(outline), missed: missed(ctx, ctx.input.references, sections) },
    };
  },
).open(
  {
    nature: "/primer/unload",
    valence:
      "Takes primer sections out of this thread: one section, a subtree or a mode's whole primer. " +
      "They leave the system prompt from the next request on; what earlier turns say about them stays.",
    input: v
      .object({ references: v.array(v.string()) })
      .eg({ references: ["/runtime/runtime/mode/harness/runtime/entity"] }),
    output: v
      .object({ unloaded: v.array(v.string()), missed: v.array(v.string()) })
      .eg({ unloaded: ["/runtime/runtime/mode/harness/runtime/entity"], missed: [] }),
  },
  async (ctx) => {
    const keys = () => Object.keys(ctx.thread.trait.PRIMED);
    const held = (reading) =>
      keys().some((key) => within(key, reading) || within(reading, key)) ||
      within(reading, home(ctx)) ||
      within(home(ctx), reading);
    const readings = (reference) => keyed(ctx, reference, sections);
    const unloaded = belt.array.unique(ctx.input.references.flatMap(readings)).filter(held);
    const absent = ctx.input.references.filter((reference) => !readings(reference).some(held));
    ctx.thread.trait.PRIMED = unloaded.reduce(
      (delta, reference) => belt.reference.unloaded(delta, home(ctx), reference),
      ctx.thread.trait.PRIMED,
    );
    await ctx.entities.em.flush();
    return { output: { unloaded, missed: absent } };
  },
);
