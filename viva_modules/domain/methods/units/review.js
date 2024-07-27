export default async function (body, runtime) {
  const { gameId, gameType, unitId, response } = body;

  const memoryData = await runtime.locals
    .client("memory/update", {
      gameId,
      gameType,
      unitId,
      response,
    })
    .ok();

  const playData = await runtime.locals
    .client("play/update", {
      gameId,
      memoryId: memoryData.memory.id,
      nextPlay: memoryData.nextPlay,
      unitId,
      response,
    })
    .ok();

  const { data: unit } = await runtime.locals.supabase
    .from("Unit")
    .select("data")
    .eq("id", unitId)
    .single();

  return { ...playData, ...memoryData };
}
