import { array } from "@vivalence/typology";
// ── warmup ──────────────────────────────────────────────────────────
// activate what you know. build confidence. no typing.
// trace-informed: pull recent successes + learning items.
// mix with fresh feed for randomness. works for first session too.

export default async (ctx) => {
  const literal = ctx.daemon.entities.literal;
  const modes = ctx.daemon.modes.game;
  const buffers = [];
  const limit = ctx.input.limit ?? 8;

  // ── fetch: success words + regular feed, mixed ────────────────────
  const successes = await literal.byLastSignal({
    signals: ["SUCCESS", "MASTERY"],
    limit: Math.ceil(limit / 2),
    blacklist: ctx.input.blacklist,
    where: { ...ctx.input.where, memories: { status: { $in: ["LEARNING", "KNOWN"] } } },
  });

  const remaining = limit - successes.length;
  const fresh = remaining > 0
    ? await literal.feed({
        limit: remaining,
        blacklist: { literals: [...(ctx.input.blacklist?.literals ?? []), ...successes.map((s) => s.id)] },
        where: ctx.input.where,
      })
    : [];

  const words = array.shuffle([...successes, ...fresh]);
  if (!words.length) return [];

  // ── find a readable sentence (all uses-words are LEARNING/KNOWN) ──
  const sentences = await literal.find(
    { ontology: "sentence", ...ctx.input.where },
    { populate: ["uses.memories"], limit: 10 },
  );
  const readable = sentences.find((s) =>
    s.uses.getItems().every((w) => {
      const status = w.memory?.status;
      return status === "LEARNING" || status === "KNOWN" || status === "GRADUATED";
    }),
  );
  if (readable) {
    buffers.push(
      await modes.exhibit.emit.present({
        layout: "pattern",
        title: "You can read this",
        literals: [readable],
      }),
    );
  }

  // ── exhibit new words ─────────────────────────────────────────────
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

  // ── flashcard (KNOWN direction) ───────────────────────────────────
  buffers.push(
    await modes.flashcard.emit.literals({
      recall: "KNOWN",
      literals: words,
    }),
  );

  // ── judge (SLOW) ─────────────────────────────────────────────────
  for (const lit of array.shuffle(words)) {
    buffers.push(
      await modes.judge.emit.literal({
        literal: lit,
        recall: "KNOWN",
        speed: { rate: "SLOW" },
      }),
    );
  }

  // ── listen(pick) vocalized ────────────────────────────────────────
  const vocalized = words.filter((w) => w.traits?.includes("VOCALIZED"));
  for (const lit of array.shuffle(vocalized)) {
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
