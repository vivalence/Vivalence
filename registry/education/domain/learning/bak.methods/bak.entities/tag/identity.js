export default async function (tag, ctx) {
  const issues = await ctx.runtime.validate.tag(tag, ["SCHEMATIC"]);
  if (issues.length > 0) throw new Error("Slug generation failed: Invalid tag");

  // const slug =

  return slug;
}
