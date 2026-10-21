import { v, Vector } from "@vivalence/typology";
import { deal } from "./deal.js";

export const SESSION = {
  limit: v.integer({ minimum: 1, maximum: 50 }).desc("How many cards, ten when left out. Example: 10").default(10),
  symbols: v.array(v.string()).desc("Symbol slugs every card must carry — narrow the session to a topic or a level. Example: ['topic.religio']").optional(),
};

export const emitter = new Vector().open(
  {
    nature: "/session",
    valence: "deal a session as a buffer on the thread: due first, then untouched by rank. Example: { thread: 'th3', limit: 10 }",
    input: v.object({ ...SESSION, thread: v.string().desc("The thread the session lands on. Example: th3") }),
  },
  async (ctx) => {
    const deck = await deal(ctx, ctx.input);
    if (!deck.length) return;
    const literals = await ctx.entities.literal.find({ slug: { $in: deck.map((held) => held.slug) } });
    ctx.pool.add(await ctx.mode.buffer({ data: { deck, language: ctx.statics.language, dealt: new Date().toISOString() }, literals }));
  },
);
