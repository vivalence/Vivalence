import make from "./make";

export default async function fromUnits(inputs, locals) {
    const { gameId, strategyId, units } = inputs;

    const { data: game, error: gameError } = await locals.supabase
        .from("Game")
        .select(`*`)
        .eq("id", gameId)
        .single();
    if (gameError) throw gameError;

    const instructions = [];
    for (const unit of units) {
        const instruction = make({ game, unit });

        const scope = { unit: { id: unit.id }, game: { id: gameId } };
        if (unit.tags && unit.tags.length > 0) {
            scope.unit.tags = unit.tags.map((tag) => ({ id: tag.id }));
        }

        instructions.push({
            type: "FLASHCARDS",
            instruction,
            scope
        });
    }

    return instructions;
}
