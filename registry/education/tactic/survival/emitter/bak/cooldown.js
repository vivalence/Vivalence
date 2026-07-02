import { array } from "@vivalence/typology";

export default async (ctx) => {
  const limit = ctx.input.limit ?? 8;
  let literals = await ctx.daemon.entities.literal.byLastSignal(
    ["FAILURE", "MISTAKE"],
    ctx.input.where,
    { limit },
  );
  if (!literals.length) {
    literals = await ctx.daemon.entities.literal.due(ctx.input.where, { limit });
  }
  if (!literals.length) {
    literals = await ctx.daemon.entities.literal.byStrength(
      { ...ctx.input.where, memories: { strength: { $gte: 0.1 } } },
      { limit },
    );
  }
  if (!literals.length) return;

  const distractors = await ctx.daemon.entities.literal.find(ctx.input.where ?? {}, { limit: 20 });
  const vocalized = literals.filter((literal) => literal.traits?.includes("VOCALIZED"));
  const written = literals.filter((literal) => !literal.traits?.includes("VOCALIZED"));

  const practice = ctx.pool.section();

  for (const literal of vocalized) {
    if (!literal.memory || literal.memory.is.failed) {
      practice.add(
        ctx.daemon.modes.game.listen.emit.literal({
          literal,
          distractors,
          gameplay: "PICK",
          recall: "LEARNING",
        }),
      );
    } else if (literal.memory.is.weak) {
      practice.add(
        ctx.daemon.modes.game.listen.emit.literal({
          literal,
          distractors,
          gameplay: "TYPE",
          recall: "KNOWN",
        }),
      );
    }
  }

  for (const literal of written) {
    if (!literal.memory || literal.memory.is.failed) {
      practice.add(
        ctx.daemon.modes.game.flashcard.emit.literals({ literal, recall: "LEARNING" }),
      );
    } else if (literal.memory.is.weak) {
      practice.add(
        ctx.daemon.modes.game.flashcard.emit.literals({ literal, recall: "KNOWN" }),
      );
    }
  }

  practice.apply(array.shuffle);
};
