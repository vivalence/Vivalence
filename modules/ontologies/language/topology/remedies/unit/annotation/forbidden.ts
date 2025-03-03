async function forbidden(issue: any, ctx: any) {
  const { entity, error } = issue.data.context;
  // const forbiddenAnnotationKey = issue.path[issue.path.length - 1];
  delete entity.annotation[error.params.additionalProperty];
  return issue.resolve();
}

export default {
  handler: forbidden,
  violation: "forbidden",
  path: ["unit", "annotation", "*"],
};
