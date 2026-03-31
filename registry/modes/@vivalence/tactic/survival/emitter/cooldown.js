import { array } from "@vivalence/typology";
// ── cooldown ────────────────────────────────────────────────────────
// error remediation. review what broke. no new literals.
// trace-targeted: FAILURE/MISTAKE → byStrength → due.
// exhibit errors → flashcard (KNOWN) → sentence context → listen

export default async (ctx) => {
  const literal = ctx.daemon.entities.literal;
  const modes = ctx.daemon.modes.game;
  const limit = ctx.input.limit ?? 8;
  const where = ctx.input.where;

  let literals = await literal.byLastSignal({
    signals: ["FAILURE", "MISTAKE"],
    limit,
    where,
  });

  if (!literals.length) {
    literals = await literal.byStrength({ limit, where });
  }
  if (!literals.length) {
    literals = await literal.due({ limit, where });
  }
  if (!literals.length) return [];

  const buffers = [];

  // ── exhibit errors
  buffers.push(
    await modes.exhibit.emit.present({
      layout: "table",
      title: "Let's review",
      literals,
    }),
  );

  // ── flashcard (KNOWN direction — show the answer, rebuild confidence)
  buffers.push(
    await modes.flashcard.emit.literals({
      recall: "KNOWN",
      literals: array.shuffle(literals),
    }),
  );

  // ── sentence context for each error word
  for (const lit of literals) {
    const sentences = await literal.find(
      { ontology: "sentence", uses: lit.id },
      { limit: 1 },
    );
    if (sentences.length) {
      buffers.push(
        await modes.shadow.emit.literals({
          literal: sentences[0],
          recall: "KNOWN",
          speed: { rate: "SLOW" },
        }),
      );
    }
  }

  // ── listen(pick) vocalized errors
  const vocalized = literals.filter((w) => w.traits?.includes("VOCALIZED"));
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
