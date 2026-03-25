export default async function (input, ctx) {
  let { scope, signal } = input;

  const buffer = await ctx.daemon.entities.buffer.findOne(scope.buffer);
  scope = { ...scope, mode: buffer.mode.id };

  const literal = buffer.props?.literal;
  const reviews = [];

  if (literal) {
    reviews.push(
      await ctx.daemon.call("/review/literal", {
        signal,
        scope: { ...scope, literal: typeof literal === "object" ? literal.id : literal },
      }),
    );
  }

  return reviews;
}

// export default async function (input, ctx) {
//   let { scope, signal } = input;
//
//   const buffer = await ctx.daemon.entities.buffer.findOne(scope.buffer);
//   scope = { ...scope, mode: buffer.mode.id };
//
//   const literal = buffer.trait?.FURNISHED?.literal;
//   const reviews = [];
//
//   if (literal) {
//     reviews.push(
//       await ctx.daemon.call("/review/literal", {
//         signal,
//         scope: { ...scope, literal: typeof literal === "object" ? literal.id : literal },
//       }),
//     );
//   }
//
//   const trait = { ...buffer.trait, REVIEWED: { signal } };
//   const traits = [...new Set([...buffer.traits, "REVIEWED"])];
//   ctx.daemon.entities.em.assign(buffer, { trait, traits });
//   await ctx.daemon.entities.em.flush();
//
//   return reviews;
// }
