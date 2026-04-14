import { array } from "@vivalence/typology";
// ── cooldown ────────────────────────────────────────────────────────
// error remediation. review what broke. no new literals.
// trace-targeted: FAILURE/MISTAKE → byStrength → due.
// exhibit errors → flashcard (KNOWN) → sentence context → listen

export default async (ctx) => {
  let literals = await ctx.daemon.entities.literal.byLastSignal(
    ["FAILURE", "MISTAKE"],
    ctx.input.where,
    { limit: ctx.input.limit ?? 8 },
  );
  if (!literals.length) {
    literals = await ctx.daemon.entities.literal.due(
      ctx.input.where,
      { limit: ctx.input.limit ?? 8 },
    );
  }
  if (!literals.length) {
    literals = await ctx.daemon.entities.literal.byStrength(
      { ...ctx.input.where, memories: { strength: { $gte: 0.1 } } },
      { limit: ctx.input.limit ?? 8 },
    );
  }
  if (!literals.length) return;

  // ── distractor pool: one fetch, shared across all game emits ──────
  const distractors = await ctx.daemon.entities.literal.find(ctx.input.where ?? {}, { limit: 20 });

  // ── listen(pick) vocalized errors
  ctx.pool
    .section(
      ...literals.map((literal) =>
        ctx.daemon.modes.game.flashcard.emit.literals({
          recall: literal.memory?.is.weak ? "KNOWN" : "LEARNING",
          literal,
        }),
      ),
      ...literals
        .filter((literal) => literal.traits?.includes("VOCALIZED"))
        .map((literal) =>
          ctx.daemon.modes.game.listen.emit.literal({
            literal,
            distractors,
            gameplay: "TYPE",
            recall: "KNOWN",
          }),
        ),
    )
    .apply(array.shuffle);
};
