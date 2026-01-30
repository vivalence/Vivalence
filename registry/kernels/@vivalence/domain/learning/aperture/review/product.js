export default async function ({ scope, signal }, ctx) {
  const reviews = [];

  if (!scope.product?.id)
    return { status: "bounce", message: "product required" };

  const product = await ctx.daemon.entities.product.findOne(
    { id: scope.product.id },
    {
      populate: ["literals", "symbols", "literals.symbols"],
      fields: ["*", "literals.id", "literals.symbols.id", "symbols.id"],
    },
  );

  product.symbols?.map((symbol) => {
    const input = { signal, scope: { ...scope, symbols: null, symbol } };
    const review = ctx.daemon.call("/review/symbol", input);
    reviews.push(review);
  });

  product.literals?.map((literal) => {
    const input = { signal, scope: { ...scope, literals: null, literal } };
    console.log("review/literal", input);
    const review = ctx.daemon.call("/review/literal", input);
    reviews.push(review);
  });

  // if (scope.literal) {const input = { signal, scope }; const review = ctx.daemon.call("/review/literal", input); reviews.push(review);} if (scope.symbol) {const input = { signal, scope }; const review = ctx.daemon.call("/review/symbol", input); reviews.push(review);}
  // scope.literal?.symbols?.map((symbol) => {const input = { signal, scope: { ...scope, symbol } }; const review = ctx.daemon.call("/review/symbol", input); reviews.push(review);});

  const results = await Promise.all(reviews);

  product.status = "DONE";

  await ctx.daemon.entities.em.flush();
  return results;
}
