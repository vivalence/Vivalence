import { array } from "@vivalence/typology";
// ── cooldown ────────────────────────────────────────────────────────
// error remediation. review what broke. no new literals.
// trace-targeted: FAILURE/MISTAKE → byStrength → due.
// exhibit errors → flashcard (KNOWN) → sentence context → listen

export default async (ctx) => {
  let literals = await ctx.daemon.entities.literal.byLastSignal({
    signals: ["FAILURE", "MISTAKE"],
    limit: ctx.input.limit ?? 8,
    where: ctx.input.where,
  });

  if (!literals.length) {
    literals = await ctx.daemon.entities.literal.byStrength({ limit: ctx.input.limit ?? 8, where: ctx.input.where });
  }
  if (!literals.length) {
    literals = await ctx.daemon.entities.literal.due({ limit: ctx.input.limit ?? 8, where: ctx.input.where });
  }
  if (!literals.length) return [];

  const buffers = [];

  // ── exhibit errors
  buffers.push(
    await ctx.daemon.modes.game.exhibit.emit.present({
      layout: "table",
      title: "Let's review",
      literals,
    }),
  );

  // ── flashcard (KNOWN direction — show the answer, rebuild confidence)
  buffers.push(
    await ctx.daemon.modes.game.flashcard.emit.literals({
      recall: "KNOWN",
      literals: array.shuffle(literals),
    }),
  );

  // ── sentence context for each error word
  for (const literal of literals) {
    const sentences = await ctx.daemon.entities.literal.find(
      { ontology: "sentence", uses: literal.id },
      { limit: 1 },
    );
    if (sentences.length) {
      buffers.push(
        await ctx.daemon.modes.game.shadow.emit.literals({
          literal: sentences[0],
          recall: "KNOWN",
          speed: { rate: "SLOW" },
        }),
      );
    }
  }

  // ── distractor pool: one fetch, shared across all game emits ──────
  const distractors = await ctx.daemon.entities.literal.find(ctx.input.where ?? {}, { limit: 30 });

  // ── listen(pick) vocalized errors
  const vocalized = literals.filter((literal) => literal.traits?.includes("VOCALIZED"));
  for (const literal of array.shuffle(vocalized)) {
    buffers.push(
      await ctx.daemon.modes.game.listen.emit.literal({
        literal,
        distractors,
        gameplay: "pick",
        recall: "KNOWN",
      }),
    );
  }

  return buffers;
};
