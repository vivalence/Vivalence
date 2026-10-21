import { string, v, Vector } from "@vivalence/typology";
import { SIGNAL } from "../../domain/types.js";
import { deal, filed, grade, locate } from "../deal.js";
import { progress as report } from "../progress.js";
import { SESSION } from "../emitter.js";

const slug = { card: v.string().desc("The card's slug, as /review or /session dealt it. Example: amor.noun") };
const FACETS = { "word.part-of-speech.": "partOfSpeech", "word.gender.": "gender", "word.lemma.": "lemma", "topic.": "topic", "level.": "level" };

export const review = new Vector().open(
  {
    nature: "/review",
    valence: "Pull the cards to quiz in the dock now: due first, then untouched by rank. Each carries its slug, both sides, an example, voice and picture when it has them, its status, lapses and the four horizons. Quiz from these, one at a time. Example: { limit: 5, symbols: ['topic.virtus'] }",
    input: v.object({
      limit: v.integer({ minimum: 1, maximum: 20 }).desc("How many cards, five when left out. Example: 5").default(5),
      symbols: v.array(v.string()).desc("Symbol slugs every card must carry — see srs_topics. Example: ['topic.virtus']").optional(),
    }),
  },
  async (ctx) => ({ language: ctx.statics.language, cards: await deal(ctx, ctx.input) }),
);

export const gradeCard = new Vector().open(
  {
    nature: "/grade",
    valence: "Grade the card the learner just answered — AGAIN wrong or blank, HARD right with struggle, GOOD right, EASY instant. Evolves its SM-2 schedule, traces the grade on this thread, returns the card with its next due time. Example: { card: 'amor.noun', signal: 'GOOD' }",
    input: v.object({ ...slug, signal: v.enum(SIGNAL).desc("AGAIN · HARD · GOOD · EASY. Example: GOOD") }),
  },
  (ctx) => grade(ctx, { ...ctx.input, thread: ctx.thread }),
);

export const progress = new Vector().open(
  {
    nature: "/progress",
    valence: "The learner report: cards, touched, untouched, due now, suspended, counts by status, the five weakest and the leeches. Use it when the learner asks how they are doing or what to focus on. Example: {}",
    input: v.object({}),
  },
  (ctx) => report(ctx),
);

export const add = new Vector().open(
  {
    nature: "/add",
    valence: "Make a new card from the conversation — the learning side and its meaning. Look it up with srs_lookup first; a new card is dealt before every other untouched one. Example: { learning: 'gratias ago', known: 'I give thanks', ontology: 'sentence', symbols: ['topic.sermo'] }",
    input: v.object({
      learning: v.string().desc("The side being learned. Example: gratias ago"),
      known: v.string().desc("Its meaning in the learner's language. Example: I give thanks"),
      ontology: v.enum(["word", "sentence"]).desc("word · sentence. Example: sentence"),
      symbols: v.array(v.string()).desc("Topic or level slugs to file it under. Example: ['topic.sermo']").default([]),
    }),
  },
  async (ctx) => {
    const held = string.fold(ctx.input.learning.replace(/-/g, " ")).replace(/\s+/g, "-");
    if ((await ctx.entities.literal.findOne({ slug: held })) !== null) return { added: false, card: (await filed(ctx, [await locate(ctx, held)]))[0] };
    const symbols = await ctx.entities.symbol.find({ slug: { $in: [ctx.input.ontology, ...ctx.input.symbols] } });
    const literal = ctx.entities.literal.create({
      slug: held,
      mode: ctx.mode.id,
      traits: ["TRANSLATED", "RANKED"],
      trait: { TRANSLATED: { known: ctx.input.known, learning: ctx.input.learning }, RANKED: { rank: 0 } },
    });
    literal.symbols.add(symbols);
    await ctx.entities.em.flush();
    return { added: true, card: (await filed(ctx, [await locate(ctx, held)]))[0] };
  },
);

export const explain = new Vector().open(
  {
    nature: "/explain",
    valence: "A card laid open: both sides, its example, its facets (part of speech, gender, lemma, topic, level), the sentences that hold its lemma, and every grade it was given. Use it after a miss, or when the learner asks why. Example: { card: 'amor.noun' }",
    input: v.object(slug),
  },
  async (ctx) => {
    const literal = await ctx.entities.literal.findOneOrFail({ slug: ctx.input.card }, { populate: ["notes", "symbols"] });
    const facets = {};
    for (const symbol of literal.symbols.getItems())
      for (const [prefix, facet] of Object.entries(FACETS)) if (symbol.slug.startsWith(prefix)) facets[facet] = symbol.slug.slice(prefix.length);
    const lemma = literal.symbols.getItems().find((symbol) => symbol.slug.startsWith("word.lemma."));
    const sentences = lemma === undefined || literal.ontology === "sentence"
      ? []
      : await ctx.entities.literal.find({ symbols: [lemma.slug], ontology: "sentence" }, { limit: 3, populate: ["notes"] });
    return {
      card: (await filed(ctx, [literal]))[0],
      facets,
      sentences: (await filed(ctx, sentences)).map(({ slug: held, learning, known }) => ({ slug: held, learning, known })),
      history: await ctx.entities.literal.history(literal),
    };
  },
);

export const session = new Vector().open(
  {
    nature: "/session",
    valence: "Deal a session into the frame beside the dock, where the learner flips and grades with the keys — due first, then untouched by rank, narrowed by symbols. Use it when the learner wants to drill on their own, or after /progress names a topic to work. Example: { limit: 10, symbols: ['topic.bellum'] }",
    input: v.object(SESSION),
  },
  async (ctx) => {
    const deck = await deal(ctx, ctx.input);
    if (!deck.length) return { dealt: 0, cards: [] };
    const [held] = await ctx.entities.buffer.find({ thread: ctx.thread, mode: ctx.mode.id }, { orderBy: { index: "desc" }, limit: 1 });
    const data = { deck, language: ctx.statics.language, dealt: new Date().toISOString() };
    if (held === undefined) {
      const emitted = await ctx.mode.emit.session({ ...ctx.input, thread: ctx.thread });
      return { dealt: deck.length, cards: deck.map((card) => card.slug), buffer: emitted.output.buffer[0].id };
    }
    await ctx.entities.buffer.updateOne({ id: held.id }, { data });
    return { dealt: deck.length, cards: deck.map((card) => card.slug), buffer: held.id };
  },
);

export const tools = new Vector().graft(review, gradeCard, progress, add, explain, session);
