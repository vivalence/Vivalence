export default async function (body, runtime) {
  const { gameId, gameType, tagId, unitId, response } = body;

  const memoryData = await runtime.locals
    .client("memory/update", {
      gameId,
      gameType,
      unitId,
      tagId,
      response,
    })
    .ok();

  const playData = await runtime.locals
    .client("play/update", {
      gameId,
      memoryId: memoryData.memory.id,
      nextPlay: memoryData.nextPlay,
      unitId,
      tagId,
      response,
    })
    .ok();

  const { data: tag } = await runtime.locals.supabase
    .from("Tag")
    .select("data")
    .eq("id", tagId)
    .single();

  return { ...tag, ...playData, ...memoryData };
}
