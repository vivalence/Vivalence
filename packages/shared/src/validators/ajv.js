import AJV from "ajv";
import ajvErrors from "ajv-errors";

export { AJV };

export default function makeAjv(options = {}) {
  const instance = new AJV({
    allErrors: true,
    verbose: true,
    $data: true,
    removeAdditional: true,
    ...options,
  });

  ajvErrors(instance);

  // ajv.addKeyword({ keyword: "slug", validate: () => true, errors: false });
  // ajv.addKeyword({ keyword: "meta", validate: () => true, errors: false });
  return instance;
}

// function schema(options = {}) {
//   const ajv = makeAjv(options);
//   return (schema, data) => {
//     const validation = ajv.compile(schema);
//     const valid = validation(data);
//     // translate to std issue format.

//     return { data, valid, isValid: valid, errors: validation.errors };

//   };
// }
