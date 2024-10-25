export default async function schema({ unit }, ctx) {
  const issues = [];

  try {
    const schema = ctx.runtime.schema.units[unit.annotation.pos];
    if (!schema) {
      throw new Error(`Schema not found for pos: ${unit.annotation.pos}`);
    }

    const { isValid, errors } = ctx.runtime.locals.validate(schema, unit);
    if (!isValid) errors.map(buildError(unit)).forEach((e) => issues.push(e));
  } catch (e) {
    issues.push({ message: e.message, context: { error: e, unit }, violation: "ERROR", path: [] });
  }

  return issues;
}

const buildError = (unit) => (error) => {
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
