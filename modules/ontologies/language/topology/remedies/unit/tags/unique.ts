async function unique(issue: any, ctx: any) {
  const constraint = issue.data.context.constraint.unique;
  const unit = issue.data.context.unit;

  const tags = await unit.tags
    .filter((tag: any) => {
      return (
        (constraint.branch
          ? tag.data.ONTOLOGICAL?.branch === constraint.branch
          : true) &&
        (constraint.leaf
          ? tag.data.ONTOLOGICAL?.leaf === constraint.leaf
          : true)
      );
    })
    .filter((tag: any) => {
      return !Object.keys(unit.annotation).some((key) => {
        return (
          key === tag.data.ONTOLOGICAL.branch &&
          unit.annotation[key] === tag.data.ONTOLOGICAL.leaf
        );
      });
    });

  for (const tag of tags) {
    unit.tags.remove(tag);
  }

  return issue.resolve();
}

export default {
  handler: unique,
  violation: "unique",
  path: ["unit", "tags"],
};
