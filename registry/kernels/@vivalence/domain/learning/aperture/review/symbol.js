export default async function ({ scope, signal }, ctx) {
  if (!scope.symbol?.id) return { status: "bounce", message: "Symbol required" };

  const symbol = await ctx.daemon.entities.symbol.findOneOrFail({
    id: scope.symbol.id,
  });

  if (!symbol.traits.includes("LEARNABLE")) {
    return { status: "bounce", message: "Invalid learnable symbol flavor" };
  }

  if (symbol.data["LEARNABLE"].type === "INDIVIDUAL") {
    delete scope.literal;
  } else if (symbol.data["LEARNABLE"].type === "RELATIONAL") {
    if (!scope.literal?.id) {
      return {
        status: "bounce",
        message: "Literal required for relational learnable symbols",
      };
    }
  } else {
    return { status: "bounce", message: "Invalid learnable symbol flavor" };
  }

  const memory = await ctx.daemon.call("/review/memory", {
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

  return { status: "success", memory, play };
}
