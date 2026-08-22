import { v, Vector } from "@vivalence/typology";
import { line } from "./line.js";

const lemmas = async (ctx) => {
  try {
    const classify = ctx.daemon.services?.nlp;
    if (!classify) return [];
    const sentences = await classify({ text: ctx.input.text });
    return [
      ...new Set(
        sentences.flat().map((token) => token.lemma?.toLowerCase()).filter(Boolean),
      ),
    ].filter((lemma) => lemma !== ctx.input.text.toLowerCase());
  } catch {
    return [];
  }
};

export const lookup = new Vector().open(
  {
    nature: "/lookup",
    valence:
      "Look a word up by text — matches the slug and both translations. Use whenever unsure " +
      "an item exists or what its slug is. A conjugated form also reports its paradigm and " +
      "infinitive; an unmatched inflection retries by lemma when the daemon can classify. " +
      "If nothing matches, the word is not in the corpus: say so, never invent a slug.",
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
      for (const lemma of await lemmas(ctx)) {
        const matched = await ctx.daemon.entities.literal.find(
          { search: lemma },
          { limit: ctx.input.limit, populate: ["retentions"] },
        );
        if (matched.length) {
          return {
            message: [
              `nothing matches "${ctx.input.text}" directly — its lemma ${lemma} does:`,
              ...matched.map(line),
            ].join("\n"),
            entities: { literal: matched },
            object: { slugs: matched.map((literal) => literal.slug) },
          };
        }
      }
      return { message: `nothing matches "${ctx.input.text}" — not in the corpus.` };
    }

    const family = await ctx.daemon.entities.literal.family(literals);
    const relatives = family.map((entry) => entry.infinitive).filter(Boolean);

    return {
      message: [
        ...literals.map(line),
        ...family.map((entry) =>
          entry.infinitive
            ? `↳ form in ${entry.paradigm.slug} · infinitive: ${line(entry.infinitive)}`
            : `↳ form in ${entry.paradigm.slug}`
        ),
      ].join("\n"),
      entities: { literal: [...literals, ...relatives] },
      object: { slugs: [...literals, ...relatives].map((literal) => literal.slug) },
    };
  },
);
