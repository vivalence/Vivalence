export default async function (body, ctx) {
  const { scope, gameType, response } = body;

  const { memory, nextPlay, error, ...memoryData } = await ctx.runtime.call("/memory/update/unit", {
    scope,
    gameType,
    response,
  });

  if (error) throw error;

  if (memoryData.memoryStatusChange)
    (async () => {
      console.log("unit memory status update event");
      const { data: unit, error } = await ctx.runtime.locals.supabase
        .from("Unit")
        .select("*")
        .eq("id", scope.unit.id)
        .eq("runtimeId", ctx.runtime.manifest.id)
        .single();
      if (error) throw error;
      const handled = await ctx.runtime.bus.emit("unit:memorystatuschange", {
        unit,
        memory,
        scope,
      });
      console.log("handled unit memory status update", handled);
    })();

  scope.memory = { id: memory.id };

  const playData = await ctx.runtime.call("/play/update/unit", {
    scope,
    nextPlay,
    response,
  });

  return { ...playData, ...memoryData, memory, nextPlay };
}
