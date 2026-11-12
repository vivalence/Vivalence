import { shard, shape, specimen, steer, ToolCall, v, Vector } from "@vivalence/typology";
import { accio } from "../../../systems/runtime/tests/scenarios/registry.js";
import { found, keyed, missed, section } from "./load.test.js";

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
      .eg({ primers: { "tactic/harvest/archivist": "# the archivist\n\nYou are the harvest operator's counterpart." }, missed: [] }),
  },
  async (ctx) => {
    const loaded = new Vector();
    for (const reference of ctx.input.references) {
      for (const entry of found(ctx, reference, (mode) => mode.primer)) section(ctx, loaded, entry, "eager");
      for (const key of keyed(ctx, reference, (mode) => mode.primer)) ctx.thread.trait.PRIMED[key] = "eager";
    }
    await ctx.entities.em.flush();
    return {
      output: {
        primers: await shape.primer.load(loaded, ctx),
        missed: missed(ctx, ctx.input.references, (mode) => mode.primer),
      },
    };
  },
);

specimen.describe("primer/load", () => {
  specimen.it("a daemon-relative reference loads harvest's real section", async () => {
    const harvest = await accio("@education/tactic/harvest");
    const francesca = {
      manifest: { type: "teacher", slug: "francesca" },
      primer: new Vector().open({ nature: "role", valence: "who she is" }, () => "You are Francesca."),
    };
    const education = { reference: "/daemon/education", modes: { tactic: { harvest }, teacher: { francesca } } };
    const runtime = { reference: "/runtime/runtime", modes: {}, daemons: { education } };
    const thread = { trait: { PRIMED: {} } };
    const flushed = [];
    const tools = new Vector().graft(primer);
    tools
      .use(shard.context.bind("runtime", runtime))
      .use(shard.context.bind("daemon", education))
      .use(shard.context.bind("reference", education.reference))
      .use(shard.context.bind("mode", francesca))
      .use(shard.context.bind("thread", thread))
      .use(shard.context.bind("entities", { em: { flush: async () => flushed.push("flush") } }));
    const out = [""];
    for (const input of [{ references: ["/tactic/harvest"] }, { references: ["/role"] }]) {
      const result = await steer.dispatch.invoke(tools, new ToolCall("primer_load"), steer.strategy.guarded)(input);
      out.push(`primer_load ${JSON.stringify(input)}`);
      out.push(JSON.stringify(result.output, null, 2));
    }
    out.push(JSON.stringify(thread.trait, null, 2), `flushed ${flushed.length}`);
    console.log(out.join("\n"));
  });
});
