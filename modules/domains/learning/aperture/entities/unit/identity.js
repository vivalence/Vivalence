export default async function ({ annotation }, ctx) {
  const issues = await ctx.runtime.ontology.assert.annotation(annotation);
  if (issues.length > 0)
    throw new Error("Slug generation failed: Invalid annotation");

  const slug = Object.keys(annotation)
    .sort()
    .map((key) => key + ":" + annotation[key])
    .join("+");

  return slug;
}
