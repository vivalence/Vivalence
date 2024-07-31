import make from "./lib/make.js";

export default async function fromUnitIds({ gameId, mask, unitIds }, ctx) {
  // const { data: game, error: gameError } = await ctx.runtime.locals.supabase .from("Game") .select(`*`) .eq("id", gameId) .single();
  // if (gameError) throw gameError;

  const units = await ctx.runtime.call("/units/fromUnitIds", { unitIds });

  const instructions = [];
  for (const unit of units) {
    const instruction = make({ unit, mask });
    instructions.push({
      type: "FLASHCARDS",
      instruction,
      scope: { unit: { id: unit.id }, game: { id: gameId } },
    });
  }

  return instructions;
}
