import { Vector, v } from "@vivalence/typology";

// @beef. no. this is shit. i want something thats more aligned with microorms where opts. more ground level. more universal across all of mikro orm.
// query · the read tool — one generic window onto the vocabulary database, the seed
// of the entity-query abstraction. Returns bare data (no message key) so the rows
// land in model context; the buffer tools stay the only ones that touch the screen.
export const query = new Vector().open(
  {
    nature: "/query",
    valence:
      "Query the vocabulary database. Two entities: 'literal' (the learnable items — words, " +
      "sentences, conjugation forms) and 'symbol' (the category tags organizing them; their " +
      "slugs feed the symbols filter here and the symbols/subject steering of the exercise " +
      "tools). For literals: text matches slug and both translations; symbols keeps only " +
      "literals tagged with ALL given slugs; ontology narrows to one kind; pick orders the " +
      "pool — match = plain filtered search, weak = weakest retention first, due = review due " +
      "now, novel = never studied, by course rank. For symbols: text matches the slug. Use " +
      "this before steering exercises — to ground what vocabulary exists, find what the " +
      "learner struggles with in a subject, or discover the symbol sets worth drilling.",
    input: v.object({
      entity: v.enum(["literal", "symbol"], { default: "literal" }),
      text: v.string().optional(),
      symbols: v.array(v.string()).optional(),
      ontology: v.enum(["word", "sentence", "conjugation"]).optional(),
      pick: v.enum(["match", "weak", "due", "novel"], { default: "match" }),
      limit: v.integer({ minimum: 1, maximum: 50 }).default(12),
    }),
  },
  async (ctx) => {
    if (ctx.input.entity === "symbol") {
      const where = ctx.input.text ? { slug: { $like: `%${ctx.input.text}%` } } : {};
      const symbols = await ctx.daemon.entities.symbol.find(where, { limit: ctx.input.limit });
      return {
        results: symbols.map((symbol) => ({ slug: symbol.slug, traits: symbol.traits })),
      };
    }

    const where = {};
    if (ctx.input.text) where.search = ctx.input.text;
    if (ctx.input.symbols?.length) where.symbols = ctx.input.symbols;
    if (ctx.input.ontology) where.ontology = ctx.input.ontology;

    const opts = { limit: ctx.input.limit, populate: ["retentions", "symbols"] };
    const fetch = {
      match: () => ctx.daemon.entities.literal.find(where, opts),
      weak: () => ctx.daemon.entities.literal.byStrength(where, opts),
      due: () => ctx.daemon.entities.literal.due(where, opts),
      novel: () => ctx.daemon.entities.literal.novel(where, opts),
    }[ctx.input.pick];
    const literals = await fetch();

    return {
      results: literals.map((literal) => ({
        slug: literal.slug,
        known: literal.trait?.TRANSLATED?.known ?? "",
        learning: literal.trait?.TRANSLATED?.learning ?? "",
        ontology: literal.ontology,
        status: literal.retention?.status ?? "UNTOUCHED",
        symbols: literal.symbols.getItems().map((symbol) => symbol.slug),
      })),
    };
  },
);
