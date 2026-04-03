import { array } from "@vivalence/typology";
// ── drill ───────────────────────────────────────────────────────────
// high volume isolated verb reps. error-aware: prioritize failed forms.
// exhibit untouched → flash (LEARNING) → write → judge (FAST)

export default async (ctx) => {
  const fed = await ctx.daemon.entities.literal.feed(ctx.input.where, {
    limit: ctx.input.limit ?? 12,
    blacklist: ctx.input.blacklist,
  });

  const errors = await ctx.daemon.entities.literal.byLastSignal(
    ["FAILURE", "MISTAKE"],
    ctx.input.where,
    { limit: Math.ceil((ctx.input.limit ?? 12) / 3), blacklist: ctx.input.blacklist },
  );

  const fedIds = new Set(fed.map((form) => form.id));
  const extra = errors.filter((error) => !fedIds.has(error.id));
  const forms = [...extra, ...fed].slice(0, ctx.input.limit ?? 12);
  if (!forms.length) return;

  // ── distractor pool: one fetch, shared across all game emits ──────
  const distractors = await ctx.daemon.entities.literal.find(ctx.input.where ?? {}, { limit: 30 });

  const untouched = forms.filter((form) => !form.memory || form.memory.is.virgin);
  if (untouched.length) {
    ctx.pool.add(
      ctx.daemon.modes.game.exhibit.emit.present({
        layout: "TABLE",
        title: ctx.input.title ?? "Forms",
        literals: untouched,
      }),
    );
  }

  ctx.pool.add(
    ctx.daemon.modes.game.flashcard.emit.literals({
      recall: "LEARNING",
      literals: array.shuffle(forms),
    }),
  );

  ctx.pool
    .section(
      ...forms.map((literal) =>
        ctx.daemon.modes.game.judge.emit.literal({
          literal,
          distractors,
          recall: "LEARNING",
          speed: { rate: "FAST" },
        }),
      ),
    )
    .add(
      ctx.daemon.modes.game.write.emit.literals({
        recall: "LEARNING",
        literals: forms,
      }),
    )
    .apply(array.shuffle);
};
