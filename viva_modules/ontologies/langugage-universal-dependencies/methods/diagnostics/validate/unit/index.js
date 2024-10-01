import validatePos from "./lib/pos.js";
import validateSchema from "./lib/schema.js";
import validateTags from "./lib/tags.js";
// import validateNLP from "./lib/nlp.js";

async function validate({ unit }, ctx) {
  const validators = [validatePos, validateSchema, validateTags]; //, validateNLP, ];

  for (const validator of validators) {
    const issues = await validator({ unit: { ...unit } }, ctx);
    if (issues.length > 0) return issues;
  }

  return [];
}

validate.pos = validatePos;
validate.schema = validateSchema;
validate.tags = validateTags;
// validate.example = validateNLP;

export default validate;
