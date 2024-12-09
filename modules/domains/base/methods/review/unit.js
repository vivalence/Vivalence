export default async function (body, ctx) {
  const { scope, signal } = body;
  delete scope.tag;

  const { data: unit, error } = await ctx.runtime.services.supabase
    .from("Unit")
    .select("*")
    .eq("id", scope.unit.id)
    .eq("runtimeId", ctx.runtime.manifest.id)
    .single();
  if (error) throw error;

  const { statusChange, ...memory } = await ctx.runtime.call("/review/memory", { scope, signal });

  if (statusChange)
    (async () => await ctx.runtime.bus.emit("MemoryStatusChange:Unit", { unit, memory, scope }))();

  scope.memory = { id: memory.id };

  const play = await ctx.runtime.call("/review/play", {
    nextIn: memory.nextIn,
    nextAt: memory.nextAt,
    lastAt: memory.lastAt,
    scope,
    signal,
  });

  return { play, memory, statusChange };
}
