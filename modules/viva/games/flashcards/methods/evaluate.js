export default async function evaluate({ scope, response }, ctx) {
  const result = await ctx.runtime.call("/units/review", {
    gameType: "FLASHCARDS",
    scope,
    response,
  });

  return result;
}
