import { traits, v, Vector } from "@vivalence/typology";

export const literal = new Vector().open(
  {
    nature: "/literal/update",
    valence:
      "Write a literal's trait data — its translation, its label. Pass the literal's slug and " +
      "a trait patch keyed by trait name; the patch merges deep over the held data, a new name " +
      "joins its traits. Returns { message, literal: [{ id, slug, traits, trait, symbol }] }.",
    input: v.object({
      slug: v
        .string()
        .desc("its address inside the daemon")
        .example("flamingo"),
      trait: v
        .record(v.string(), v.unknown())
        .desc("trait data by name, merged deep over what the literal holds")
        .example({ LABELED: { name: "Flamingo — six species" } }),
    }).example({
      slug: "flamingo",
      trait: { LABELED: { name: "Flamingo — six species" } },
    }),
  },
  async (ctx) => {
    const held = await ctx.entities.literal.findOneOrFail({ slug: ctx.input.slug });
    const updated = await ctx.entities.literal.updateOne(
      { id: held.id },
      traits.patch(held, ctx.input.trait),
    );
    return { message: `updated literal ${updated.slug}`, literal: [updated] };
  },
);
