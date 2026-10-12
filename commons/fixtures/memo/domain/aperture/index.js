import { v, Vector } from "@vivalence/typology";
import { card } from "../card.js";
import { SIGNAL, STATUS } from "../types.js";

export const locate = (ctx, slug) =>
  ctx.entities.literal.findOneOrFail({ slug }, { populate: ["notes"], refresh: true });

const pick = {
  symbols: v
    .array(v.string())
    .desc(
      "Symbol slugs every card must carry — a topic, a level, a part of speech. Example: ['topic.religio']",
    )
    .optional(),
  limit: v.integer({ minimum: 1, maximum: 50 }).desc("How many cards. Example: 10"),
  blacklist: v.array(v.string()).desc("Literal ids to leave out. Example: []").optional(),
};
const picking = (verb) => async (ctx) => {
  const { symbols, ...options } = ctx.input;
  const rows = await ctx.entities.literal[verb](symbols === undefined ? {} : { symbols }, options);
  return rows.map(card);
};
const one = { literal: v.string().desc("The card's slug. Example: amor.noun") };

export const aperture = new Vector()
  .open(
    {
      nature: "/pick/literal/feed",
      valence: "due cards first, then untouched ones by rank. Example: { limit: 10 }",
      input: v.object(pick),
    },
    picking("feed"),
  )
  .open(
    {
      nature: "/pick/literal/novel",
      valence: "untouched cards by rank. Example: { limit: 10 }",
      input: v.object(pick),
    },
    picking("novel"),
  )
  .open(
    {
      nature: "/pick/literal/due",
      valence:
        "cards whose next review is now or past, the most overdue first. Example: { limit: 10 }",
      input: v.object(pick),
    },
    picking("due"),
  )
  .open(
    {
      nature: "/pick/literal/byStrength",
      valence: "reviewed cards, the weakest first. Example: { limit: 10 }",
      input: v.object(pick),
    },
    picking("byStrength"),
  )
  .open(
    {
      nature: "/pick/literal/sample",
      valence: "reviewed cards at random. Example: { limit: 10 }",
      input: v.object(pick),
    },
    picking("sample"),
  )
  .open(
    {
      nature: "/pick/literal/byStatus",
      valence:
        "reviewed cards in the named statuses, by rank. Example: { status: ['LEARNING'], limit: 10 }",
      input: v.object({
        ...pick,
        status: v
          .array(v.enum(STATUS))
          .desc("The statuses to pick. Example: ['LEARNING', 'UNKNOWN']"),
      }),
    },
    picking("byStatus"),
  )
  .open(
    {
      nature: "/pick/literal/leeches",
      valence:
        "cards lapsed at least this often, the weakest first — suspended ones included. Example: { lapses: 8, limit: 10 }",
      input: v.object({
        ...pick,
        lapses: v
          .integer({ minimum: 1 })
          .desc("The lapse threshold, eight when left out. Example: 8")
          .optional(),
      }),
    },
    picking("leeches"),
  )
  .open(
    {
      nature: "/review/literal",
      valence:
        "grade one card; its schedule evolves and the grade is traced. Example: { literal: 'amor.noun', signal: 'GOOD' }",
      input: v.object({
        ...one,
        signal: v.enum(SIGNAL).desc("AGAIN · HARD · GOOD · EASY. Example: GOOD"),
        thread: v.string().desc("The thread the grade was given on. Example: th3").optional(),
      }),
    },
    async (ctx) => {
      const literal = await locate(ctx, ctx.input.literal);
      await ctx.entities.literal.review(literal, {
        signal: ctx.input.signal,
        thread: ctx.input.thread,
      });
      return card(await locate(ctx, ctx.input.literal));
    },
  )
  .open(
    {
      nature: "/preview/literal",
      valence:
        "the four horizons, in hours, each grade would move the card to. Example: { literal: 'amor.noun' }",
      input: v.object(one),
    },
    async (ctx) => ctx.entities.literal.preview(await locate(ctx, ctx.input.literal)),
  )
  .open(
    {
      nature: "/history/literal",
      valence: "every grade the card was given, oldest first. Example: { literal: 'amor.noun' }",
      input: v.object(one),
    },
    async (ctx) => ctx.entities.literal.history(await locate(ctx, ctx.input.literal)),
  )
  .open(
    {
      nature: "/suspend/literal",
      valence:
        "take a card out of every deal until it is resumed. Example: { literal: 'amor.noun', reason: 'leech' }",
      input: v.object({ ...one, reason: v.string().desc("Why. Example: leech") }),
    },
    async (ctx) => {
      await ctx.entities.note.suspend(await locate(ctx, ctx.input.literal), ctx.input.reason);
      return card(await locate(ctx, ctx.input.literal));
    },
  )
  .open(
    {
      nature: "/resume/literal",
      valence: "deal a suspended card again. Example: { literal: 'amor.noun' }",
      input: v.object(one),
    },
    async (ctx) => {
      await ctx.entities.note.resume(await locate(ctx, ctx.input.literal));
      return card(await locate(ctx, ctx.input.literal));
    },
  );
