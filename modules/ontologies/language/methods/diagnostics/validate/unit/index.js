import validatePos from "./validators/pos.js";
import validateSchema from "./validators/schema.js";
import validateTags from "./validators/tags.js";
// import validateNLPfromExample from "./lib/nlp.js";

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

runtime.assertionFactory = (input) => {
  //
};
runtime.assert = (input) => {
  // const { object = {}, type = "", validations = [] } = input;
};
