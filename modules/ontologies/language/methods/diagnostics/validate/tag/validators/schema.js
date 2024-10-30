export default async function schema({ tag }, ctx) {
  const issues = [];

  try {
    const schema = ctx.runtime.schema.tag;

    if (!schema) {
      throw new Error(`Schema not found for tag: ${tag}`);
    }

    const { isValid, errors } = ctx.runtime.locals.validate(schema, tag);
    if (!isValid) errors.map(buildError(tag)).forEach((e) => issues.push(e));
  } catch (e) {
    issues.push({ message: e.message, context: { error: e, tag }, violation: "ERROR", path: [] });
  }

  return issues;
}

const buildError = (tag) => (error) => {
  const path = ["unit", ...error.instancePath.split("/").filter((p) => p !== "")];
  const context = { error, unit };
  if (error.keyword === "enum") {
    return {
      message: `unit invalid: ${error.message}`,
      path,
      violation: "invalid",
      context,
    };
  } else if (error.keyword === "required") {
    return {
      message: `unit property missing: ${error.message}`,
      path: [...path, error.params.missingProperty],
      violation: "required",
      context,
    };
  } else if (error.keyword === "not") {
    return {
      message: `unit invalid: ${error.instancePath} ${error.message}`,
      path,
      violation: "forbidden",
      context,
    };
  } else if (error.keyword === "additionalProperties") {
    return {
      message: `unit invalid: ${error.instancePath} ${error.message}`,
      path: [...path, error.params.additionalProperty],
      violation: "forbidden",
      context,
    };
  } else if (error.keyword === "if") {
    return {
      message: `unit invalid: ${error.instancePath} ${error.message}`,
      path,
      violation: "conditional",
      context,
    };
  }
  const unknownError = {
    message: `unknown error: ${error.instancePath} ${error.message}`,
    path,
    violation: "unknown",
    context,
  };
  return unknownError;
};
