import { array } from "@vivalence/typology";
// ── drill ───────────────────────────────────────────────────────────
// high volume isolated verb reps. error-aware: prioritize failed forms.
// exhibit untouched → flash (LEARNING) → write → judge (FAST)

export default async (ctx) => {
  const literal = ctx.daemon.entities.literal;
  const modes = ctx.daemon.modes.game;
  const limit = ctx.input.limit ?? 12;

  const fed = await literal.feed({
    limit,
    blacklist: ctx.input.blacklist,
    where: ctx.input.where,
  });

  const errors = await literal.byLastSignal({
    signals: ["FAILURE", "MISTAKE"],
    limit: Math.ceil(limit / 3),
    blacklist: ctx.input.blacklist,
    where: ctx.input.where,
  });

  const fedIds = new Set(fed.map((f) => f.id));
  const extra = errors.filter((e) => !fedIds.has(e.id));
  const forms = [...extra, ...fed].slice(0, limit);
  if (!forms.length) return [];

  const buffers = [];

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
      literals: array.shuffle(forms),
    }),
  );

  buffers.push(
    await modes.write.emit.literals({
      recall: "LEARNING",
      literals: array.shuffle(forms),
    }),
  );

  for (const lit of array.shuffle(forms)) {
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
