import { belt, v, Vector } from "@vivalence/typology";
import { found, home, keyed, missed, narrow, outline, seat, within } from "../reference/index.js";

const { Tool } = v.primitives.hallucination;

const References = v.object({ references: v.array(v.string()) });

export const tool = new Vector()
  .open(
    {
      nature: "/tool/load",
      valence:
        "Loads tools into this thread: one tool, a mode's whole tree, or every mode a reference covers. " +
        "Each loaded tool is declared and can be called from the next round on. " +
        "A wider reference loads more: start narrow.",
      input: References.eg(
        { references: ["/daemon/education/mode/tactic/harvest/drain"] },
        { references: ["/tactic/harvest", "/runtime/runtime/mode/harness/runtime/fs"] },
      ),
      output: v
        .object({ tools: v.array(Tool), missed: v.array(v.string()) })
        .eg({
          missed: [],
          tools: [
            {
              name: "daemon_education_tactic_harvest_drain",
              valence: "Writes the daemon's truth back to the dataset files.",
              input: { type: "object", properties: { topography: { type: "string" } } },
            },
          ],
        }),
    },
    async (ctx) => {
      const loaded = ctx.input.references.flatMap((reference) => found(ctx, reference));
      for (const entry of loaded) seat(ctx, ctx.tools, entry);
      const keys = ctx.input.references.flatMap((reference) => keyed(ctx, reference));
      ctx.thread.trait.TOOLED = keys.reduce(belt.reference.loaded, ctx.thread.trait.TOOLED);
      await ctx.entities.em.flush();
      return {
        output: {
          tools: belt.hallucinate.declarations(ctx.tools).filter((held) =>
            loaded.some((entry) => within(belt.hallucinate.signalOf(held.name), narrow(ctx, entry.reference))),
          ),
          missed: missed(ctx, ctx.input.references),
        },
      };
    },
  )
  .open(
    {
      nature: "/tool/preload",
      valence:
        "Keeps tools listed in this thread without loading them: each stays in the system prompt by reference " +
        "and one sentence from the next request on, and is not callable until tool_load. A wider reference lists more.",
      input: References.eg(
        { references: ["/tactic/harvest"] },
        { references: ["/runtime/runtime/mode/harness/runtime/fs"] },
      ),
      output: v
        .object({
          tools: v.array(v.object({ reference: v.string(), valence: v.string().optional() })),
          missed: v.array(v.string()),
        })
        .eg({
          tools: [{ reference: "/daemon/education/mode/tactic/harvest/drain", valence: "Writes the dataset." }],
          missed: [],
        }),
    },
    async (ctx) => {
      const listed = ctx.input.references.flatMap((reference) => found(ctx, reference));
      const keys = ctx.input.references.flatMap((reference) => keyed(ctx, reference));
      ctx.thread.trait.TOOLED = keys.reduce(
        (delta, key) => belt.reference.preloaded(delta, home(ctx), key),
        ctx.thread.trait.TOOLED,
      );
      await ctx.entities.em.flush();
      return { output: { tools: listed.flatMap(outline), missed: missed(ctx, ctx.input.references) } };
    },
  )
  .open(
    {
      nature: "/tool/unload",
      valence:
        "Takes tools out of this thread: one tool, a subtree or a whole mode. " +
        "They are no longer declared nor callable from the next round on; " +
        "what earlier turns say about them stays.",
      input: References.eg(
        { references: ["/runtime/runtime/mode/harness/runtime/fs/delete"] },
        { references: ["/tactic/harvest"] },
      ),
      output: v
        .object({ unloaded: v.array(v.string()), missed: v.array(v.string()) })
        .eg({ unloaded: ["/runtime/runtime/mode/harness/runtime/fs/delete"], missed: [] }),
    },
    async (ctx) => {
      const keys = () => Object.keys(ctx.thread.trait.TOOLED);
      const held = (reading) =>
        keys().some((key) => within(key, reading) || within(reading, key)) ||
        within(reading, home(ctx)) ||
        within(home(ctx), reading);
      const unloaded = belt.array.unique(ctx.input.references.flatMap((reference) => keyed(ctx, reference))).filter(held);
      const absent = ctx.input.references.filter((reference) => !keyed(ctx, reference).some(held));
      for (const reference of unloaded) ctx.tools.trim(narrow(ctx, reference));
      ctx.thread.trait.TOOLED = unloaded.reduce(
        (delta, reference) => belt.reference.unloaded(delta, home(ctx), reference),
        ctx.thread.trait.TOOLED,
      );
      await ctx.entities.em.flush();
      return { output: { unloaded, missed: absent } };
    },
  );
