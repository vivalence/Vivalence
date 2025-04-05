export default async function evaluate({ scope, signal }, ctx) {
  return [
    await ctx.runtime.call("/review/unit", { scope, signal }),
    await ctx.runtime.call("/review/tag", { scope, signal }),
  ];
}
