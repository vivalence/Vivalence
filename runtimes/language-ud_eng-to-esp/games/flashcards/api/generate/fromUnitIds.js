import make from "./make";

export default async function fromUnitIds(inputs, locals) {
  const { gameId, unitIds } = inputs;

  const { data: game, error: gameError } = await locals.supabase
    .from("Game")
    .select(`*`)
    .eq("id", gameId)
    .single();
  if (gameError) throw gameError;

  const units = await locals.client("units/fromUnitIds", { unitIds }).ok();

  const instructions = [];
  for (const unit of units) {
    const instruction = make({ game, unit });
    instructions.push({
      type: "FLASHCARDS",
      instruction,
      scope: { unit: { id: unit.id }, game: { id: gameId } },
    });
  }

  return instructions;
}
