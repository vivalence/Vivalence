import { object } from "@vivalence/shared";

export default async function (input, ctx) {
  let { scope, signal } = input;

  const options = {
    populate: ["literals", "literals.symbols", "symbols"],
    fields: ["producer.id", "commissioner.id", "literals.id", "literals.symbols.id", "symbols.id"],
  };

  const product = await ctx.daemon.entities.product //
    .findOne(scope.product, options);

  scope = object.merge(scope, {
    producer: product.producer.id,
    commissioner: product.commissioner.id,
  });

  const reviews = await Promise.all([
    ...product.literals.map((literal) =>
      ctx.daemon.call("/review/literal", {
        signal,
        scope: { ...scope, literal: literal.id },
      }),
    ),
    ...product.symbols.map((symbol) =>
      ctx.daemon.call("/review/symbol", {
        signal,
        scope: { ...scope, symbol: symbol.id },
      }),
    ),
  ]);

  product.status = "DONE";
  await ctx.daemon.entities.em.flush();
  return reviews;
}
