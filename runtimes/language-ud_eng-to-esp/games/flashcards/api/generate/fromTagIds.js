import make from "./make";

export default async function fromTagIds(inputs, locals) {
  const { gameId, strategyId, tagIds, blacklist, take } = inputs;

  const { data: game, error: gameError } = await locals.supabase
    .from("Game")
    .select(`*`)
    .eq("id", gameId)
    .single();
  if (gameError) throw gameError;

  const units = await locals
    .client("units/fromTagIds", {
      gameId,
      tagIds,
      blacklist: blacklist.units,
      take: take || 5,
    })
    .ok();

  const instructions = [];
  for (const unit of units) {
    const instruction = make({ game, unit });
    instructions.push({
      type: "FLASHCARDS",
      instruction,
      scope: {
        unit: { id: unit.id, tags: tagIds.map((tagId) => ({ id: tagId })) },
        game: { id: gameId },
      },
    });
  }

  return instructions;
}
