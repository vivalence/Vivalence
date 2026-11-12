import { traits, v, Vector } from "@vivalence/typology";

export const symbol = new Vector().open(
  {
    nature: "/symbol/update",
    valence:
      "Write a symbol's trait data — its label, its ontology. Pass the symbol's slug and a " +
      "trait patch keyed by trait name; the patch merges deep over the held data, a new name " +
      "joins its traits. Returns { message, symbol: [{ id, slug, traits, trait }] }.",
    input: v.object({
      slug: v
        .string()
        .desc("the word")
        .example("wading-bird"),
      trait: v
        .record(v.string(), v.unknown())
        .desc("trait data by name, merged deep over what the symbol holds")
        .example({ LABELED: { name: "wading bird" } }),
    }).example({
      slug: "wading-bird",
      trait: { LABELED: { name: "wading bird" } },
    }),
  },
  async (ctx) => {
    const held = await ctx.entities.symbol.findOneOrFail({ slug: ctx.input.slug });
    const updated = await ctx.entities.symbol.updateOne(
      { id: held.id },
      traits.patch(held, ctx.input.trait),
    );
    return { message: `updated symbol ${updated.slug}`, symbol: [updated] };
  },
);
