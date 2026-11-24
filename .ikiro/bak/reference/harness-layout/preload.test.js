import { shard, specimen, steer, ToolCall, v, Vector } from "@vivalence/typology";
import * as harness from "../../../commons/harnesses/runtime/runtime-harness.viva.js";
import { accio } from "../../../systems/runtime/tests/scenarios/registry.js";
import { found, keyed, missed, natures } from "./load.test.js";

const within = (inner, outer) => natures(outer).every((nature, index) => natures(inner)[index] === nature);
const outline = (entry) =>
  entry.pattern
    ? [{ reference: entry.reference, valence: entry.pattern.valence }]
    : steer.trie.leaves(entry.vector).map(({ pattern, steps }) => ({
        reference: `${entry.reference}/${steps.map((step) => step.nature).join("/")}`,
        valence: pattern.valence,
      }));

export const preload = new Vector().open(
  {
    nature: "/tool/preload",
    valence:
      "Keeps tools listed in this thread without loading them: each stays in the system prompt by reference " +
      "and one sentence from the next request on, and is not callable until tool_load. A wider reference lists more.",
    input: v
      .object({ references: v.array(v.string()) })
      .eg({ references: ["/tactic/harvest"] }, { references: ["/runtime/runtime/mode/harness/runtime/fs"] }),
    output: v
      .object({
        tools: v.array(v.object({ reference: v.string(), valence: v.string().optional() })),
        missed: v.array(v.string()),
      })
      .eg({ tools: [{ reference: "/daemon/education/mode/tactic/harvest/drain", valence: "Writes the dataset." }], missed: [] }),
  },
  async (ctx) => {
    const listed = ctx.input.references.flatMap((reference) => found(ctx, reference));
    const covered = (reference) =>
      Object.entries(ctx.thread.trait.TOOLED).some(([key, load]) => load === "eager" && within(reference, key));
    for (const reference of ctx.input.references)
      for (const key of keyed(ctx, reference)) if (!covered(key)) ctx.thread.trait.TOOLED[key] = "lazy";
    await ctx.entities.em.flush();
    return { output: { tools: listed.flatMap(outline), missed: missed(ctx, ctx.input.references) } };
  },
);

const listing = (ctx) =>
  Object.entries(ctx.thread.trait.TOOLED)
    .filter(([, load]) => load === "lazy")
    .flatMap(([reference]) => found(ctx, reference).flatMap(outline))
    .map((held) => `${held.reference} — ${held.valence}`)
    .join("\n");

specimen.describe("tool/preload", () => {
  specimen.it("marks lazy, declares nothing, lists in the next system prompt", async () => {
    const harvest = await accio("@education/tactic/harvest");
    const francesca = { manifest: { type: "teacher", slug: "francesca" }, tools: new Vector() };
    const education = { reference: "/daemon/education", modes: { tactic: { harvest }, teacher: { francesca } } };
    const runtime = {
      reference: "/runtime/runtime",
      modes: { harness: { runtime: { manifest: harness.manifest, tools: harness.tools } } },
      daemons: { education },
    };
    const thread = { trait: { TOOLED: { "/runtime/runtime/mode/harness/runtime/fs": "eager" } } };
    const ctx = { runtime, daemon: education, reference: education.reference, mode: francesca, thread };
    const tools = new Vector().graft(preload);
    tools
      .use(shard.context.bind("runtime", runtime))
      .use(shard.context.bind("daemon", education))
      .use(shard.context.bind("reference", education.reference))
      .use(shard.context.bind("mode", francesca))
      .use(shard.context.bind("thread", thread))
      .use(shard.context.bind("entities", { em: { flush: async () => {} } }));
    const input = { references: ["/tactic/harvest", "/runtime/runtime/mode/harness/runtime/fs/read"] };
    const result = await steer.dispatch.invoke(tools, new ToolCall("tool_preload"), steer.strategy.guarded)(input);
    const cut = (text) => (text.length > 96 ? `${text.slice(0, 96)}…` : text);
    console.log(
      [
        "",
        `tool_preload ${JSON.stringify(input)}`,
        ...result.output.tools.map((held) => `listed   ${held.reference}`),
        ...shard.hallucinate.declarations(tools).map((held) => `declared ${held.name}`),
        JSON.stringify(thread.trait, null, 2),
        "system prompt section, next request:",
        ...listing(ctx).split("\n").map(cut),
      ].join("\n"),
    );
  });
});
