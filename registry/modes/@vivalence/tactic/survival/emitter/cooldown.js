// ── cooldown ────────────────────────────────────────────────────────
// relaxed listening. no typing. easy direction.
// listen (pick, KNOWN) → flash (KNOWN)

export default async (ctx) => {
  const literals = await ctx.daemon.entities.literal.feed({
    symbols: ctx.input.seek?.symbols,
    user: ctx.user.id,
    take: ctx.input.batch ?? 8,
    blacklist: ctx.input.blacklist,
  });
  if (!literals.length) return [];

  const buffers = [];
  const modes = ctx.daemon.modes.game;

  for (const lit of literals) {
    if (lit.trait?.VOCALIZED) {
      buffers.push(
        await modes.listen.emit.literal({
          literal: lit,
          gameplay: "pick",
          recall: "KNOWN",
        }),
      );
    }
  }

  buffers.push(
    await modes.flashcard.emit.literals({
      recall: "KNOWN",
      literals,
    }),
  );

  return buffers;
};
