async function forbidden(issue: any, ctx: any) {
  const { error, unit } = issue.context;
  // const forbiddenAnnotationKey = issue.path[issue.path.length - 1];
  delete unit.annotation[error.params.additionalProperty];
  await ctx.runtime.entities.em.flush();

  return await issue.resolve();
}

export default {
  handler: forbidden,
  violation: "forbidden",
  path: ["unit", "annotation", "*"],
};
