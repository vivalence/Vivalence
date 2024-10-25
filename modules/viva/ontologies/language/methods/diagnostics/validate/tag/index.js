import validateSchema from "./validators/schema.js";

async function validate({ tag }, ctx) {
  const validators = [validateSchema];

  for (const validator of validators) {
    const issues = await validator({ tag: { ...tag } }, ctx);
    if (issues.length > 0) return issues;
  }

  return [];
}

validate.schema = validateSchema;

export default validate;
