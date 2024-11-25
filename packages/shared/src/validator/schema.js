import Ajv from "ajv";
import ajvErrors from "ajv-errors";

function create(options = {}) {
  const ajv = new Ajv({
    allErrors: true,
    verbose: true,
    $data: true,
    removeAdditional: true,
    ...options,
  });

  ajvErrors(ajv);

  ajv.addKeyword({ keyword: "slug", validate: () => true, errors: false });
  ajv.addKeyword({ keyword: "meta", validate: () => true, errors: false });

  return (schema, data) => {
    const validation = ajv.compile(schema);
    const valid = validation(data);
    return { data, valid, isValid: valid, errors: validation.errors };
  };
}

export default create;
