export default async function generate({ scope, response }, locals) {
    const result = await locals.client("units", {
        gameType: "FLASHCARDS",
        gameId: scope.game.id,
        unitId: scope.unit.id,
        response
    });
    // TODO tags

    return result.ok();
}
