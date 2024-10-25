export default async function (body, ctx) {
  const { scope, signal } = body;
  delete scope.tag;

  const { data: unit, error } = await ctx.runtime.locals.supabase
    .from("Unit")
    .select("*")
    .eq("id", scope.unit.id)
    .eq("runtimeId", ctx.runtime.manifest.id)
    .single();
  if (error) throw error;

  const { statusChange, ...memory } = await ctx.runtime.call("/memory/update", { scope, signal });

  if (statusChange)
    (async () => {
      const event = { unit, memory, scope };
      const handled = await ctx.runtime.bus.emit("unit:memorystatuschange", event);
      console.log("handled unit memory status update", event, handled);
    })();

  scope.memory = { id: memory.id };

  const play = await ctx.runtime.call("/play/update", {
    nextIn: memory.nextIn,
    nextAt: memory.nextAt,
    lastAt: memory.lastAt,
    scope,
    signal,
  });

  return { play, memory, statusChange };
}
