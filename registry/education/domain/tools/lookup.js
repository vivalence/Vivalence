import { v, Vector } from "@vivalence/typology";
import { line } from "./line.js";

export const lookup = new Vector().open(
  {
    nature: "/lookup",
    valence:
      "Look a word up by text — matches the slug and both translations. Use whenever unsure " +
      "an item exists or what its slug is. If nothing matches, the word is not in the " +
      "corpus: say so, never invent a slug.",
    input: v.object({
      text: v.string({ minLength: 1 }).desc("The text to look up."),
      limit: v.integer({ minimum: 1, maximum: 50 }).default(12),
    }),
  },
  async (ctx) => {
    const literals = await ctx.daemon.entities.literal.find(
      { search: ctx.input.text },
      { limit: ctx.input.limit, populate: ["retentions"] },
    );

    if (!literals.length) {
      return { message: `nothing matches "${ctx.input.text}" — not in the corpus.` };
    }

    return {
      message: literals.map(line).join("\n"),
      entities: { literal: literals },
      object: { slugs: literals.map((literal) => literal.slug) },
    };
  },
);
