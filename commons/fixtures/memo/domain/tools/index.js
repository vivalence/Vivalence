import { v, Vector } from "@vivalence/typology";
import { card } from "../card.js";
import { locate } from "../aperture/index.js";

const slug = { card: v.string().desc("The card's slug. Example: amor.noun") };

export const tools = new Vector()
  .open(
    {
      nature: "/lookup",
      valence: "Find cards by any text — the slug, the learning side or its meaning. Use it before /add to see whether a card already exists. Example: { search: 'love', limit: 5 }",
      input: v.object({
        search: v.string().desc("The text to find. Example: love"),
        limit: v.integer({ minimum: 1, maximum: 20 }).desc("How many cards, five when left out. Example: 5").default(5).optional(),
      }),
    },
    async (ctx) => (await ctx.entities.literal.find({ search: ctx.input.search }, { limit: ctx.input.limit, populate: ["notes"] })).map(card),
  )
  .open(
    {
      nature: "/sentences",
      valence: "The sentences that hold a word's lemma — context for a word the learner keeps missing. Example: { card: 'amor.noun', limit: 3 }",
      input: v.object({ ...slug, limit: v.integer({ minimum: 1, maximum: 10 }).desc("How many sentences, three when left out. Example: 3").default(3).optional() }),
    },
    async (ctx) => {
      const word = await ctx.entities.literal.findOneOrFail({ slug: ctx.input.card }, { populate: ["symbols"] });
      const lemmas = word.symbols.getItems().filter((symbol) => symbol.slug.startsWith("word.lemma.")).map((symbol) => symbol.slug);
      if (!lemmas.length) return { card: ctx.input.card, lemma: null, sentences: [] };
      const rows = await ctx.entities.literal.find({ symbols: { $in: lemmas }, ontology: "sentence" }, { limit: ctx.input.limit, populate: ["notes"] });
      return { card: ctx.input.card, lemma: lemmas[0], sentences: rows.map(card) };
    },
  )
  .open(
    {
      nature: "/topics",
      valence: "Every topic and level of the deck with its card count — what a session can be narrowed to with symbols. Example: {}",
      input: v.object({}),
    },
    async (ctx) => {
      const groupings = await ctx.entities.symbol.find({ $or: [{ slug: { $like: "topic.%" } }, { slug: { $like: "level.%" } }] }, { orderBy: { slug: "asc" } });
      return Promise.all(
        groupings.map(async (symbol) => ({
          slug: symbol.slug,
          name: symbol.trait.LABELED.name,
          description: symbol.trait.LABELED.description,
          cards: (await ctx.entities.literal.find({ symbols: [symbol.slug] }, { fields: ["id"] })).length,
        })),
      );
    },
  )
  .open(
    { nature: "/history", valence: "Every grade a card was given, oldest first, each with the status it left. Example: { card: 'amor.noun' }", input: v.object(slug) },
    async (ctx) => ({ card: ctx.input.card, grades: await ctx.entities.literal.history(await locate(ctx, ctx.input.card)) }),
  )
  .open(
    {
      nature: "/leeches",
      valence: "The cards the learner keeps lapsing on, weakest first — candidates to explain, to break into sentences, or to suspend. Example: { lapses: 4, limit: 5 }",
      input: v.object({
        lapses: v.integer({ minimum: 1 }).desc("The lapse threshold, eight when left out. Example: 4").default(8).optional(),
        limit: v.integer({ minimum: 1, maximum: 20 }).desc("How many cards, five when left out. Example: 5").default(5).optional(),
      }),
    },
    async (ctx) => (await ctx.entities.literal.leeches({}, { lapses: ctx.input.lapses, limit: ctx.input.limit })).map(card),
  )
  .open(
    {
      nature: "/suspend",
      valence: "Take a card out of every deal until it is resumed — for a leech, or a card the learner asks to skip. Example: { card: 'amor.noun', reason: 'leech' }",
      input: v.object({ ...slug, reason: v.string().desc("Why, in a few words. Example: leech") }),
    },
    async (ctx) => {
      await ctx.entities.note.suspend(await locate(ctx, ctx.input.card), ctx.input.reason);
      return card(await locate(ctx, ctx.input.card));
    },
  )
  .open(
    { nature: "/resume", valence: "Deal a suspended card again. Example: { card: 'amor.noun' }", input: v.object(slug) },
    async (ctx) => {
      await ctx.entities.note.resume(await locate(ctx, ctx.input.card));
      return card(await locate(ctx, ctx.input.card));
    },
  );
