import { object } from "@vivalence/shared";

export default async function evaluate(input, ctx) {
  return await ctx.daemon.call("/review/product", input);
}
