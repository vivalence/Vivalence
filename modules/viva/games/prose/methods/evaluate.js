import { deepMerge } from "@vivalence/shared";

export default async function evaluate(inputs, ctx) {
  const { scope } = inputs;
  const perf = performance.now();

  const review = {
    gameType: "PROSE",
    response: "NEUTRAL",
    scope,
  };

  const evaluation = await Promise.all([
    ctx.runtime.call(
      "/tags/review",
      deepMerge(review, { scope: { tag: { id: scope.aspect.tag.id } } }),
    ),
    ...scope.leafs.tags.map((leaf) =>
      ctx.runtime.call("/tags/review", deepMerge(review, { scope: { tag: { id: leaf.id } } })),
    ),
  ]);

  console.log(`[PERF] prose evaluate took ${performance.now() - perf}ms`);
  return evaluation;
}
