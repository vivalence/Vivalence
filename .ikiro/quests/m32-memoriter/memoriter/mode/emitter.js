import { Vector, v } from "@vivalence/typology";

export const emitter = new Vector().open(
  {
    nature: "/session",
    input: v.object({
      limit: v.integer({ minimum: 1, maximum: 50 }).default(10),
      topic: v.string().optional(),
    }),
  },
  async (ctx) => {
    const where = ctx.input.topic ? { symbols: [ctx.input.topic] } : {};
    const literals = await ctx.daemon.entities.literal.feed(where, { limit: ctx.input.limit });
    if (!literals.length) return;
    const status = Object.fromEntries(
      literals.map((literal) => [literal.slug, literal.retention?.status ?? "UNTOUCHED"]),
    );
    ctx.pool.add(ctx.mode.app.buffer({ data: { status }, literals }));
  },
);
