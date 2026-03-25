// ── warmup ──────────────────────────────────────────────────────────
// easy recall, get in the mood. no typing. recognition + audio.
// exhibit new → flash (KNOWN) → judge (SLOW) → listen (pick, KNOWN)

export default async (ctx) => {
  const words = await ctx.daemon.entities.literal.feed({
    symbols: ctx.input.seek?.symbols,
    user: ctx.user.id,
    take: ctx.input.batch ?? 8,
    blacklist: ctx.input.blacklist,
  });
  if (!words.length) return [];

  const buffers = [];
  const modes = ctx.daemon.modes.game;

  const untouched = words.filter((w) => !w.memory || w.memory.status === "UNTOUCHED");
  if (untouched.length) {
    buffers.push(
      await modes.exhibit.emit.present({
        layout: "table",
        title: "New words",
        literals: untouched,
      }),
    );
  }

  buffers.push(
    await modes.flashcard.emit.literals({
      recall: "KNOWN",
      literals: words,
    }),
  );

  for (const lit of words) {
    buffers.push(
      await modes.judge.emit.literal({
        literal: lit,
        recall: "KNOWN",
        speed: { rate: "SLOW" },
      }),
    );
  }

  const vocalized = words.filter((w) => w.trait?.VOCALIZED);
  for (const lit of vocalized) {
    buffers.push(
      await modes.listen.emit.literal({
        literal: lit,
        gameplay: "pick",
        recall: "KNOWN",
      }),
    );
  }

  return buffers;
};
