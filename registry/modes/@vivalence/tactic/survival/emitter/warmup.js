import { array } from "@vivalence/typology";
// ── warmup ──────────────────────────────────────────────────────────
// activate what you know. build confidence. no typing.
// three sources: near-due successes, due now, weak by strength.
// 4 each, 12 total, deduped and shuffled.

export default async (ctx) => {
  // console.log({ input: ctx.input });
  const horizon = new Date(Date.now() + (ctx.input.horizon ?? 48) * 60 * 60 * 1000);
  const seen = new Set();
  const collect = (items) => {
    const added = [];
    for (const item of items) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      added.push(item);
    }
    return added;
  };

  // ── source A: near-due successes (due within horizon) ─────────────
  const failures = collect(
    await ctx.daemon.entities.literal.byLastSignal(
      ["MISTAKE", "FAILURE", "NEUTRAL"],
      { ...ctx.input.where, memories: { nextAt: { $lt: horizon } } },
      { limit: 4, blacklist: ctx.input.blacklist },
    ),
  );
  // ── source B: due right now ───────────────────────────────────────
  const due = collect(
    await ctx.daemon.entities.literal.feed(ctx.input.where, {
      limit: 4,
      blacklist: ctx.input.blacklist,
    }),
  );
  // ── source C: weakest by strength ─────────────────────────────────
  const weak = collect(
    await ctx.daemon.entities.literal.byStrength(
      { ...ctx.input.where, memories: { strength: { $gte: 0.1, $lte: 0.5 } } },
      { limit: 4, blacklist: ctx.input.blacklist },
    ),
  );
  const words = array.shuffle([...failures, ...due, ...weak]);

  if (!words.length) return;

  // ── distractor pool: one fetch, shared across all game emits ──────
  const distractors = await ctx.daemon.entities.literal.find(ctx.input.where ?? {}, { limit: 30 });

  // ── exhibit new words ─────────────────────────────────────────────
  const untouched = words.filter((word) => !word.memory || word.memory.is.virgin);
  if (untouched.length) {
    ctx.pool.add(
      ctx.daemon.modes.game.exhibit.emit.present({
        layout: "TABLE",
        title: "New words",
        literals: untouched,
      }),
    );
  }

  // console.log({ head: { untouched, distractors, words, weak, due } });
  // ── shuffled body: flashcard + judge + listen ─────────────────────
  ctx.pool
    .section(
      ...words
        // .filter((l) => !l.memory?.is.virgin)
        // .filter((word) => !word.traits?.includes("VOCALIZED"))
        .map((literal) =>
          ctx.daemon.modes.game.flashcard.emit.literals({
            recall: !literal.memory?.is.succeeded ? "KNOWN" : "LEARNING",
            literal,
          }),
        ),

      ...words
        .filter((l) => l.memory?.is.virgin)
        .map((literal) =>
          ctx.daemon.modes.game.judge.emit.literal({
            literal,
            distractors,
            speed: { rate: "SLOW" },
          }),
        ),
      ...words
        .filter((word) => word.traits?.includes("VOCALIZED"))
        .map((literal) =>
          ctx.daemon.modes.game.listen.emit.literal({
            literal,
            distractors,
            // gameplay: "TYPE",
            gameplay: !literal.memory?.is.succeeded ? "PICK" : "TYPE",
            recall: "KNOWN",
          }),
        ),
    )
    .apply(array.shuffle);
};
