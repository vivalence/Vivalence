export default async function ({ scope, signal }, ctx) {
  delete scope.symbol;

  if (!scope.literal?.id) return { status: "bounce", message: "Literal required" };

  const { statusChange, ...memory } = await ctx.daemon.call("/review/memory", {
    scope,
    signal,
  });

  scope.memory = { id: memory.id };

  const play = await ctx.daemon.call("/review/play", {
    nextIn: memory.nextIn,
    nextAt: memory.nextAt,
    lastAt: memory.lastAt,
    scope,
    signal,
  });

  return { play, memory, statusChange };
}
