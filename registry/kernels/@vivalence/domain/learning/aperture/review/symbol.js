export default async function (input, ctx) {
  let { scope, signal, symbol } = input;

  if (symbol) scope.symbol = symbol.id;
  if (!scope.symbol) return { status: "bounce", message: "Symbol required" };

  symbol = await ctx.daemon.entities.symbol.findOneOrFail(scope.symbol);

  if (!symbol.traits.includes("LEARNABLE")) {
    return { status: "bounce", message: "Invalid learnable symbol flavor" };
  }

  if (symbol.data["LEARNABLE"].type === "INDIVIDUAL") {
    delete scope.literal;
  } else if (symbol.data["LEARNABLE"].type === "RELATIONAL") {
    return {
      status: "bounce",
      message: "symbol relational learning depracated temporarily",
    };
    if (!scope.literal) {
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

  // scope.memory = memory.id;
  // const play = await ctx.daemon.call("/review/play", {nextIn: memory.nextIn, nextAt: memory.nextAt, lastAt: memory.lastAt, scope, signal,});

  return memory; //play,
}
