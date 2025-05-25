import AJV from "ajv";
import ajvErrors from "ajv-errors";
import addFormats from "ajv-formats";

export function makeAjv(options = {}) {
  let instance = new AJV({
    allErrors: true,
    verbose: true,
    $data: true,
    removeAdditional: "all",
    ...options,
  });

  instance = addFormats(instance, [
    "date-time",
    "time",
    "date",
    "email",
    "hostname",
    "ipv4",
    "ipv6",
    "uri",
    "uri-reference",
    "uuid",
    "uri-template",
    "json-pointer",
    "relative-json-pointer",
    "regex",
  ]);

  ajvErrors(instance);

  // ajv.addKeyword({ keyword: "slug", validate: () => true, errors: false });
  // ajv.addKeyword({ keyword: "meta", validate: () => true, errors: false });
  return instance;
}
export const ajv = makeAjv();
export { AJV };

// function schema(options = {}) {
//   const ajv = makeAjv(options);
//   return (schema, data) => {
//     const validation = ajv.compile(schema);
//     const valid = validation(data);
//     // translate to std issue format.

//     return { data, valid, isValid: valid, errors: validation.errors };

//   };
// }
