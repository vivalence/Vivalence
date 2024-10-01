import validateSchema from "./lib/schema.js";

async function validate({ tag }, ctx) {
  const validators = [validateSchema];

  for (const validator of validators) {
    const issues = await validator({ unit: { ...tag } }, ctx);
    if (issues.length > 0) return issues;
  }

  return [];
}

validate.schema = validateSchema;

export default validate;
