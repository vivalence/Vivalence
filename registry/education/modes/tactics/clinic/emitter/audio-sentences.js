import { array, object } from "@vivalence/typology";

export default async (ctx) => {
  const literals = await ctx.daemon.entities.literal.feed(
    object.merge({ traits: ["VOCALIZED"] }, ctx.input.where),
    { limit: ctx.input.limit ?? 4, blacklist: ctx.input.blacklist },
  );
  if (!literals.length) return;

  for (const literal of literals) {
    const strong = literal.retention && !literal.retention.is.virgin && literal.retention.strength >= 0.3;
    ctx.pool.add(
      ctx.daemon.modes.game["rep-o-gram"].emit.listen.literal({
        literal,
        gameplay: strong ? "TYPE" : "PICK",
        recall: "LEARNING",
      }),
    );
  }

  ctx.pool.apply(array.shuffle);
};
