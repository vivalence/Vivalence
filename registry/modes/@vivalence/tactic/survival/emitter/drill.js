import { array } from "@vivalence/typology";
// ── drill ───────────────────────────────────────────────────────────
// high volume isolated verb reps. error-aware: prioritize failed forms.
// exhibit untouched → flash (LEARNING) → write → judge (FAST)

export default async (ctx) => {
  const fed = await ctx.daemon.entities.literal.feed({
    limit: ctx.input.limit ?? 12,
    blacklist: ctx.input.blacklist,
    where: ctx.input.where,
  });

  const errors = await ctx.daemon.entities.literal.byLastSignal({
    signals: ["FAILURE", "MISTAKE"],
    limit: Math.ceil((ctx.input.limit ?? 12) / 3),
    blacklist: ctx.input.blacklist,
    where: ctx.input.where,
  });

  const fedIds = new Set(fed.map((form) => form.id));
  const extra = errors.filter((error) => !fedIds.has(error.id));
  const forms = [...extra, ...fed].slice(0, ctx.input.limit ?? 12);
  if (!forms.length) return [];

  // ── distractor pool: one fetch, shared across all game emits ──────
  const distractors = await ctx.daemon.entities.literal.find(ctx.input.where ?? {}, { limit: 30 });

  const buffers = [];

  const untouched = forms.filter((form) => !form.memory || form.memory.is.virgin);
  if (untouched.length) {
    buffers.push(
      await ctx.daemon.modes.game.exhibit.emit.present({
        layout: "table",
        title: ctx.input.title ?? "Forms",
        literals: untouched,
      }),
    );
  }

  buffers.push(
    await ctx.daemon.modes.game.flashcard.emit.literals({
      recall: "LEARNING",
      literals: array.shuffle(forms),
    }),
  );

  buffers.push(
    await ctx.daemon.modes.game.write.emit.literals({
      recall: "LEARNING",
      literals: array.shuffle(forms),
    }),
  );

  for (const literal of array.shuffle(forms)) {
    buffers.push(
      await ctx.daemon.modes.game.judge.emit.literal({
        literal,
        distractors,
        recall: "LEARNING",
        speed: { rate: "FAST" },
      }),
    );
  }

  return buffers;
};
