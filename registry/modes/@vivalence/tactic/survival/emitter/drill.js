// ── drill ───────────────────────────────────────────────────────────
// high volume isolated verb reps.
// exhibit untouched → flash (LEARNING) → write → judge (FAST)

export default async (ctx) => {
  const forms = await ctx.daemon.entities.literal.feed({
    symbols: ctx.input.seek?.symbols,
    user: ctx.user.id,
    take: ctx.input.batch ?? 12,
    blacklist: ctx.input.blacklist,
  });
  if (!forms.length) return [];

  const buffers = [];
  const modes = ctx.daemon.modes.game;

  const untouched = forms.filter((f) => !f.memory || f.memory.status === "UNTOUCHED");
  if (untouched.length) {
    buffers.push(
      await modes.exhibit.emit.present({
        layout: "table",
        title: ctx.input.title ?? "Forms",
        literals: untouched,
      }),
    );
  }

  buffers.push(
    await modes.flashcard.emit.literals({
      recall: "LEARNING",
      literals: forms,
    }),
  );

  buffers.push(
    await modes.write.emit.literals({
      recall: "LEARNING",
      literals: forms,
    }),
  );

  for (const lit of forms) {
    buffers.push(
      await modes.judge.emit.literal({
        literal: lit,
        recall: "LEARNING",
        speed: { rate: "FAST" },
      }),
    );
  }

  return buffers;
};
