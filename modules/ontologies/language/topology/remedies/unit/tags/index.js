async function unique(issue, ctx) {}

async function forbidden(issue, ctx) {
  const unit = issue.context.unit;
  const ontology = issue.context.forbidden;
  const annotation = unit.data.annotation;

  const tag = unit.tags.find((tag) => {
    return (
      (ontology.branch ? tag.data.ONTOLOGICAL?.branch === ontology.branch : true) &&
      (ontology.leaf ? tag.data.ONTOLOGICAL?.leaf === ontology.leaf : true)
    );
  });

  const result = await ctx.runtime.locals.supabase
    .from("_TagToUnit")
    .delete()
    .eq("A", tag.id)
    .eq("B", unit.id);

  return { resolved: !result.error, tag, unit };
}

export default {
  // handlers: { required, unique }, // forbidden,unique
  path: ["tag"],
};
