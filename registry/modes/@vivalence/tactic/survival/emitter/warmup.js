import { array } from "@vivalence/typology";
// ── warmup ──────────────────────────────────────────────────────────
// activate what you know. build confidence. no typing.
// three sources: near-due successes, due now, weak by strength.
// 4 each, 12 total, deduped and shuffled.

export default async (ctx) => {
  let buffers = [];
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
    await ctx.daemon.entities.literal.byLastSignal({
      signals: ["MISTAKE", "FAILURE", "NEUTRAL"],
      limit: 4,
      blacklist: ctx.input.blacklist,
      where: { ...ctx.input.where, memories: { nextAt: { $lt: horizon } } },
    }),
  );
  // ── source B: due right now ───────────────────────────────────────
  const due = collect(
    await ctx.daemon.entities.literal.due({
      limit: 4,
      blacklist: ctx.input.blacklist,
      where: ctx.input.where,
    }),
  );
  // ── source C: weakest by strength ─────────────────────────────────
  const weak = collect(
    await ctx.daemon.entities.literal.byStrength({
      limit: 4,
      blacklist: ctx.input.blacklist,
      where: { ...ctx.input.where, memories: { strength: { $lte: 0.5 } } },
    }),
  );
  const words = array.shuffle([...failures, ...due, ...weak]);
  if (!words.length) return [];

  // ── distractor pool: one fetch, shared across all game emits ──────
  const distractors = await ctx.daemon.entities.literal.find(ctx.input.where ?? {}, { limit: 30 });

  // ── flashcard (KNOWN direction) ───────────────────────────────────
  buffers.push(
    await ctx.daemon.modes.game.flashcard.emit.literals({
      recall: "KNOWN",
      literals: array.shuffle(words),
    }),
  );

  // ── judge (SLOW) ─────────────────────────────────────────────────
  for (const literal of words) {
    buffers.push(
      await ctx.daemon.modes.game.judge.emit.literal({
        literal,
        distractors,
        recall: "KNOWN",
        speed: { rate: "SLOW" },
      }),
    );
  }

  // ── listen(pick) vocalized ────────────────────────────────────────
  const vocalized = words.filter((word) => word.traits?.includes("VOCALIZED"));
  for (const literal of vocalized) {
    buffers.push(
      await ctx.daemon.modes.game.listen.emit.literal({
        literal,
        distractors,
        gameplay: "pick",
        recall: "KNOWN",
      }),
    );
  }

  buffers = array.shuffle(buffers);

  // ── exhibit new words ─────────────────────────────────────────────
  const untouched = words.filter((word) => !word.memory || word.memory.is.virgin);
  if (untouched.length) {
    buffers.unshift(
      await ctx.daemon.modes.game.exhibit.emit.present({
        layout: "table",
        title: "New words",
        literals: untouched,
      }),
    );
  }

  return buffers;
};
