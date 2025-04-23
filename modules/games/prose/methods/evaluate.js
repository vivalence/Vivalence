import { deepMerge } from "@vivalence/shared";

export default async function evaluate(inputs, ctx) {
  const { scope } = inputs;
  const evaluations = [];

  if (scope.tag) {
    const result = await ctx.runtime.call("/review/tag", { scope, signal: "NEUTRAL" });
    evaluations.push(result);
  }
  if (scope.tags) {
    const result = await Promise.all(
      scope.tags
        ?.map((tag) => deepMerge({}, scope, { tag }))
        .map((scope) => ctx.runtime.call("/review/tag", { scope, signal: "NEUTRAL" })),
    );
    result.map((e) => evaluations.push(e));
  }

  return evaluations;
}
