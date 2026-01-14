async function forbidden(issue, ctx) {
  const { daemon } = ctx;
  const { error, literal } = issue.context;

  if (!literal || !error?.params?.additionalProperty) {
    return issue.onError({ message: "Missing literal or error context" });
  }

  const forbiddenKey = error.params.additionalProperty;
  
  // Remove the forbidden property from annotation
  delete literal.annotation[forbiddenKey];
  
  try {
    await daemon.entities.em.flush();
    return issue.resolve();
  } catch (err) {
    return issue.onError({ 
      message: "Failed to update literal", 
      error: err 
    });
  }
}

export default {
  handler: forbidden,
  violation: "forbidden",
  path: ["literal", "annotation", "*"],
};
