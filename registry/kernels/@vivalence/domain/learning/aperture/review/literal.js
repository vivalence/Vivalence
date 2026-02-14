import { object } from "@vivalence/shared";
import { is } from "@vivalence/typology";
export default async function (input, ctx) {
  let { scope = {}, signal } = input;

  if (!is.id(scope.literal))
    return { status: "bounce", message: "literal required" };

  // const options = { populate: ["symbols"], fields: ["id", "symbols.id"] };
  // const literal = await ctx.daemon.entities.literal //
  //   .findOne(scope.literal, options);
  // const reviews = [...literal.symbols.map((symbol) => ctx.daemon.call("/review/symbol", {signal, scope: { ...scope, symbol: symbol.id },}),),]; delete scope.symbol, delete scope.symbols;

  const { change, ...memory } = await ctx.daemon.call("/review/memory", input);

  scope.memory = memory;

  const play = await ctx.daemon.call("/review/play", {
    nextIn: memory.nextIn,
    nextAt: memory.nextAt,
    lastAt: memory.lastAt,
    scope,
    signal,
  });

  return {
    literal: { play, memory, change },
    // symbols: await Promise.all(reviews),
  };
}
// import { object } from "@vivalence/shared";
// export default async function (input, ctx) {
//   let { scope = {}, literal, signal } = input;

//   if (literal) scope.literal = { id: literal.id };
//   if (!scope.literal?.id)
//     return { status: "bounce", message: "Symbol required" };

//   const options = { populate: ["symbols"], fields: ["id", "symbols.id"] };
//   literal = await ctx.daemon.entities.literal //
//     .findOne(scope.literal, options);

//   const reviews = [
//     ...literal.symbols.map((symbol) =>
//       ctx.daemon.call("/review/symbol", {
//         signal,
//         scope: { ...scope, symbol },
//       }),
//     ),
//   ];

//   delete scope.symbol, delete scope.symbols;

//   const { change, ...memory } = await ctx.daemon.call("/review/memory", {
//     scope,
//     signal,
//   });

//   scope.memory = { id: memory.id };

//   const play = await ctx.daemon.call("/review/play", {
//     nextIn: memory.nextIn,
//     nextAt: memory.nextAt,
//     lastAt: memory.lastAt,
//     scope,
//     signal,
//   });

//   return {
//     literal: { play, memory, change },
//     symbols: await Promise.all(reviews),
//   };
// }
