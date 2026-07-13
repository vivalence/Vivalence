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
