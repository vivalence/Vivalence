export default async function (body, ctx) {
  const { scope, gameType, response } = body;

  const { memory, nextPlay, error, ...memoryData } = await ctx.runtime.call("/memory/update/tag", {
    scope,
    gameType,
    response,
  });

  if (error) throw error;

  scope.memory = { id: memory.id };

  const playData = await ctx.runtime.call("/play/update/tag", {
    scope,
    nextPlay,
    response,
  });

  return { ...playData, ...memoryData, memory, nextPlay };
}
