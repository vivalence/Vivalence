import { from } from "./factory.js";

export async function fromSymbols(inputs, ctx) {
  // const { scope, symbolIds, mask, blacklist, take } = inputs;
  // await ctx.daemon.entities.symbol.find({},{})
  // const literals = await ctx.daemon.call("/literals/fromSymbolIds", {symbolIds, blacklist, take: take || 5,});

  return await from({ scope, mask, literals }, ctx);
}

export async function fromLiterals(inputs, ctx) {
  // const { scope, mask, unitIds } = inputs;
  // const units = await ctx.daemon.call("/literals/fromLiteralIds", { unitIds });
  // return await from({ scope, mask, units }, ctx);
}

export async function pending(input, ctx) {
  const literals = await ctx.daemon.call("/pick/literal/feed", input);
  if (literals.length === 0)
    return [{ type: "SIGNAL", data: { signal: "COMPLETED" } }];
  return from(literals, input.scope);
}
