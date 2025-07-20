export default async function ({ annotation }, ctx) {
  const issues = await ctx.runtime.validate.annotation(annotation);
  if (issues.length > 0) {
    console.log("[@unit/identity] issues", annotation, issues);
    throw new Error("Slug generation failed: Invalid annotation");
  }

  // const slug = Object.keys(annotation) .sort() .map((key) => key + ":" + annotation[key]) .join("+");
  const slug = Object.keys(annotation)
    .sort()
    .map((key) => key + ":" + annotation[key])
    .join("),(");

  return `[(${slug})]`;
}
