import { shard, specimen, steer, ToolCall, v, Vector } from "@vivalence/typology";
import * as harness from "/Users/finn/vivalence/code/vivalence/commons/harnesses/runtime/runtime-harness.viva.js";
import { accio } from "/Users/finn/vivalence/code/vivalence/systems/runtime/tests/scenarios/registry.js";
import { found, natures } from "./load.js";

const within = (inner, outer) => natures(outer).every((nature, index) => natures(inner)[index] === nature);
const outline = (entry) =>
  entry.pattern
    ? [{ reference: entry.reference, valence: entry.pattern.valence }]
    : steer.trie.leaves(entry.tools).map(({ pattern, steps }) => ({
        reference: `${entry.reference}/${steps.map((step) => step.nature).join("/")}`,
        valence: pattern.valence,
      }));

const preload = new Vector().open(
  {
    nature: "/tool/preload",
    valence:
      "Keeps tools listed in this thread without loading them: each stays in the system prompt by reference " +
      "and one sentence from the next request on, and is not callable until tool_load. A wider reference lists more.",
    input: v
      .object({ references: v.array(v.string()) })
      .eg({ references: ["/tactic/harvest"] }, { references: ["/runtime/runtime/mode/harness/runtime/fs"] }),
    output: v
      .object({ tools: v.array(v.object({ reference: v.string(), valence: v.string().optional() })) })
      .eg({ tools: [{ reference: "/daemon/education/mode/tactic/harvest/drain", valence: "Writes the dataset." }] }),
  },
  async (ctx) => {
    const listed = ctx.input.references.flatMap((reference) => found(ctx, reference));
    const covered = (reference) =>
      Object.entries(ctx.thread.trait.TOOLED).some(([key, load]) => load === "eager" && within(reference, key));
    for (const entry of listed) if (!covered(entry.reference)) ctx.thread.trait.TOOLED[entry.reference] = "lazy";
    await ctx.entities.em.flush();
    return { output: { tools: listed.flatMap(outline) } };
  },
);

const listing = (ctx) =>
  Object.entries(ctx.thread.trait.TOOLED)
    .filter(([, load]) => load === "lazy")
    .flatMap(([reference]) => found(ctx, reference).flatMap(outline))
    .map((held) => `${held.reference} — ${held.valence}`)
    .join("\n");

export { preload,listing,outline };
