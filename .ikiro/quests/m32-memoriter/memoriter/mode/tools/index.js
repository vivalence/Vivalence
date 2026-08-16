import { Vector, v, string } from "@vivalence/typology";
import { SIGNAL } from "../types.js";
import { progress as picture } from "../progress.js";

const strip = (literal) => ({
  slug: literal.slug,
  ontology: literal.ontology,
  known: literal.trait?.TRANSLATED?.known,
  learning: literal.trait?.TRANSLATED?.learning,
  example: literal.trait?.EXEMPLIFIED ?? null,
  status: literal.retention?.status ?? "UNTOUCHED",
});

export const review = new Vector().open(
  {
    nature: "/review",
    valence:
      "Pull the cards to quiz right now: due cards first, then new ones up to the limit. Returns slug, both sides, and retention status per card. Quiz from these, one at a time.",
    input: v.object({
      limit: v.integer({ minimum: 1, maximum: 20 }).default(5),
      topic: v.string({ description: "optional topic symbol slug, e.g. topic.religio" }).optional(),
    }),
  },
  async (ctx) => {
    const where = ctx.input.topic ? { symbols: [ctx.input.topic] } : {};
    const cards = await ctx.daemon.entities.literal.feed(where, { limit: ctx.input.limit });
    return { count: cards.length, cards: cards.map(strip) };
  },
);

export const grade = new Vector().open(
  {
    nature: "/grade",
    valence:
      "Grade the card the learner just answered. AGAIN = wrong, HARD = struggled, GOOD = correct, EASY = instant. Evolves the SM-2 schedule and returns the next due time in hours.",
    input: v.object({
      card: v.string({ description: "the card slug" }),
      signal: v.enum(SIGNAL),
    }),
  },
  async (ctx) => {
    const literal = await ctx.daemon.entities.literal.findOne(
      { slug: ctx.input.card },
      { populate: ["retentions"] },
    );
    if (!literal) return { graded: false, message: `no card ${ctx.input.card} — pull cards with /review first` };
    const retention = await literal.review({ enum: ctx.input.signal }, ctx);
    return {
      graded: true,
      card: literal.slug,
      status: retention.status,
      nextInHours: retention.nextIn,
      interval: retention.state?.interval ?? 0,
      ease: retention.state?.ease ?? null,
    };
  },
);

export const progress = new Vector().open(
  {
    nature: "/progress",
    valence:
      "The learner report: counts by retention status, how many cards are due now, and the weakest cards. Use to answer progress questions or pick a focus.",
    input: v.object({}),
  },
  async (ctx) => {
    const [report, weak] = await Promise.all([
      picture(ctx.daemon.entities),
      ctx.daemon.entities.literal.byStrength({}, { limit: 5 }),
    ]);
    return {
      ...report,
      weakest: weak.map((literal) => ({
        slug: literal.slug,
        learning: literal.trait?.TRANSLATED?.learning,
        status: literal.retention?.status,
      })),
    };
  },
);

export const add = new Vector().open(
  {
    nature: "/add",
    valence:
      "Create a new card from the conversation: a Latin expression and its English meaning. Use when the learner asks to save or remember something.",
    input: v.object({
      learning: v.string({ description: "the Latin side" }),
      known: v.string({ description: "the English side" }),
      ontology: v.enum(["word", "sentence"]).default("word"),
    }),
  },
  async (ctx) => {
    const slug = string.fold(ctx.input.learning.replace(/-/g, " ")).replace(/\s+/g, "-");
    const { literal, symbol, em } = ctx.daemon.entities;
    const existing = await literal.findOne({ slug });
    if (existing) return { added: false, message: `card ${slug} already exists` };
    const root = await symbol.findOne({ slug: ctx.input.ontology });
    if (!root) return { added: false, message: `no root symbol ${ctx.input.ontology} on this daemon` };
    const card = literal.create({
      slug,
      traits: ["TRANSLATED"],
      trait: { TRANSLATED: { known: ctx.input.known, learning: ctx.input.learning } },
    });
    card.symbols.add(root);
    await em.flush();
    return { added: true, card: card.slug, ontology: card.ontology };
  },
);

export const tools = new Vector().slurp(review).slurp(grade).slurp(progress).slurp(add);
