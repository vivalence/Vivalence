export default async function evaluate({ scope, response }, locals) {
  const result = await locals
    .client("units/review", {
      gameType: "FLASHCARDS",
      gameId: scope.game.id,
      unitId: scope.unit.id,
      response,
    })
    .ok();
  // TODO tags

  return result;
}
