import { Vector } from "@vivalence/typology";

export const manifest = { type: "probe", slug: "poke", version: "0.0.1", traits: ["EXPOSED"] };

export const aperture = new Vector().open("/poke", async (input, ctx) => {
  const literal = await ctx.entities.literal.findOneOrFail({ slug: input.slug });
  literal.trait = { ...literal.trait, POKED: { at: input.at } };
  await ctx.entities.literal.em.flush();
  return { slug: literal.slug, poked: literal.trait.POKED };
});
