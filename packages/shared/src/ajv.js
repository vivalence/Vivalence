import Ajv from "https://cdn.skypack.dev/ajv@6?dts";
import ajvErrors from "https://cdn.skypack.dev/ajv-errors@3?dts";

const ajv = new Ajv({
  allErrors: true,
  verbose: true,
  $data: true,
  removeAdditional: true,
});

ajvErrors(ajv);
ajv.addKeyword({ keyword: "meta", validate: () => true, errors: false });

export function validate(schema, data) {
  const validation = ajv.compile(schema);
  const valid = validation(data);
  return { isValid: valid, errors: validation.errors };
}

export default ajv;
