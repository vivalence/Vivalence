async function required(issue: any, ctx: any) {
  const unit = issue.data.context.entity;

  const constraint = issue.data.context.constraint.required;

  const ONTOLOGICAL = {
    branch: constraint.branch || null,
    leaf: constraint.leaf || unit.annotation[constraint.branch] || null,
  };

  const tag = await ctx.runtime.entities.tag.findOne({
    data: { ONTOLOGICAL },
  });

  if (tag) {
    unit.tags.add(tag);
    issue.resolve();
  } else {
    issue.markError({ message: "Remedy failure: [unit tags]:required - tag not found" });
  }

  return issue;
}

export default {
  handler: required,
  violation: "required",
  path: ["unit", "tags"],
};
