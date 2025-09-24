export default async function evaluate({ scope, signal }, ctx) {
  const reviews = await ctx.runtime.call("/review/scope", { scope, signal });
  // const reviews = await Promise.all([await ctx.runtime.call("/review/unit", { scope, signal }), await ctx.runtime.call("/review/tag", { scope, signal }),]);
  return reviews;
}
