// ── buildup ─────────────────────────────────────────────────────────
// conjugation paradigms, agreement chains. exhibit only new forms.
// exhibit untouched → pick (paradigm distractors) → match → judge

export default async (ctx) => {
  const forms = await ctx.daemon.entities.literal.feed({
    limit: ctx.input.limit ?? 6,
    blacklist: ctx.input.blacklist,
    where: ctx.input.where,
  });
  if (!forms.length) return [];

  const buffers = [];
  const modes = ctx.daemon.modes.game;

  const untouched = forms.filter((f) => !f.memory || f.memory.status === "UNTOUCHED");
  if (untouched.length) {
    buffers.push(
      await modes.exhibit.emit.present({
        layout: "table",
        title: ctx.input.title ?? "Conjugation",
        subtitle: ctx.input.subtitle,
        literals: untouched,
      }),
    );
  }

  for (const lit of forms.slice(0, 3)) {
    const distractors = forms.filter((f) => f.id !== lit.id).slice(0, 3);
    buffers.push(
      await modes.pick.emit.literal({
        literal: lit,
        distractors,
        recall: "LEARNING",
      }),
    );
  }

  buffers.push(
    await modes.match.emit.batch({
      literals: forms,
      gameplay: "translate",
      recall: "LEARNING",
    }),
  );

  for (const lit of forms) {
    buffers.push(
      await modes.judge.emit.literal({
        literal: lit,
        recall: "LEARNING",
        speed: { rate: "NORMAL" },
      }),
    );
  }

  return buffers;
};
