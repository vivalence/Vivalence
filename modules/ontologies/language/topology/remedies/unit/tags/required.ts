async function required(issue: any, ctx: any) {
  const unit = issue.context.unit;

  if (!unit.tags.isInitialized())
    return issue.onError({ message: "unit.tags must be initialized" });

  const constraint = issue.context.constraint.required;

  const tagQuery = {
    data: {
      ONTOLOGICAL: {
        branch: constraint.branch || null,
        leaf: constraint.leaf || unit.annotation[constraint.branch] || null,
      },
    },
  };

  const tagIssues = await ctx.runtime.validate.tag(tagQuery, ["EXISTENTIAL"]);
  if (tagIssues.length > 0) return issue.spawn(tagIssues);

  const tag = await ctx.runtime.entities.tag.findOne(tagQuery);

  if (!tag) issue.onError({ message: "[unit tags]:required - tag not found" });

  unit.tags.add(tag);

  await ctx.runtime.entities.em.flush();

  return await issue.resolve();
}

export default {
  handler: required,
  violation: "required",
  path: ["unit", "tags"],
};
