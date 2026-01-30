export default async function ({ scope, signal }, ctx) {
  const reviews = [];

  if (scope.unit) {
    const input = { signal, scope };
    const review = ctx.runtime.call("/review/unit", input);
    reviews.push(review);
  }

  if (scope.tag) {
    const input = { signal, scope };
    const review = ctx.runtime.call("/review/tag", input);
    reviews.push(review);
  }

  scope.tags?.map((tag) => {
    const input = { signal, scope: { ...scope, tags: null, tag } };
    const review = ctx.runtime.call("/review/tag", input);
    reviews.push(review);
  });

  scope.unit?.tags?.map((tag) => {
    const input = { signal, scope: { ...scope, tag } };
    const review = ctx.runtime.call("/review/tag", input);
    reviews.push(review);
  });

  scope.units?.map((unit) => {
    const input = { signal, scope: { ...scope, units: null, unit } };
    const review = ctx.runtime.call("/review/scope", input); // ish-safe
    reviews.push(review);
  });

  return await Promise.all(reviews);
}
