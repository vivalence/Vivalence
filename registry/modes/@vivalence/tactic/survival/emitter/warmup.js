// ── warmup ──────────────────────────────────────────────────────────
// easy recall, get in the mood. no typing. recognition + audio.
// exhibit new → flash (KNOWN) → judge (SLOW) → listen (pick, KNOWN)

export default async (ctx) => {
  const words = await ctx.daemon.entities.literal.feed({
    limit: ctx.input.limit ?? 8,
    blacklist: ctx.input.blacklist,
    where: ctx.input.where,
  });
  if (!words.length) return [];

  const buffers = [];

  const untouched = words.filter((w) => !w.memory || w.memory.status === "UNTOUCHED");
  if (untouched.length) {
    buffers.push(
      await ctx.daemon.modes.game.exhibit.emit.present({
        layout: "table",
        title: "New words",
        literals: untouched,
      }),
    );
  }

  buffers.push(
    await ctx.daemon.modes.game.flashcard.emit.literals({ recall: "KNOWN", literals: words }),
  );

  for (const lit of words) {
    buffers.push(
      await ctx.daemon.modes.game.judge.emit.literal({
        literal: lit,
        recall: "KNOWN",
        speed: { rate: "SLOW" },
      }),
    );
  }

  const vocalized = words.filter((w) => w.traits?.includes("VOCALIZED"));
  for (const lit of vocalized) {
    buffers.push(
      await ctx.daemon.modes.game.listen.emit.literal({
        literal: lit,
        gameplay: "pick",
        recall: "KNOWN",
      }),
    );
  }

  return buffers;
};
