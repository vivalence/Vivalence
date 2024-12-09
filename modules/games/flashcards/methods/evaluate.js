export default async function evaluate({ scope, signal }, ctx) {
  const result = await ctx.runtime.call("/review/unit", { scope, signal });
  return result;
}
