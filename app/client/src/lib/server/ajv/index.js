import Ajv from "ajv";
import ajvErrors from "ajv-Errors";

const ajv = new Ajv({
    allErrors: true,
    verbose: true,
    $data: true,
    removeAdditional: true
});
ajvErrors(ajv);
ajv.addKeyword({ keyword: "meta", validate: () => true, errors: false });

/* const { isValid, errors } = validate( schema, unit,); */
export function validate(schema, data) {
    const validation = ajv.compile(schema);
    const valid = validation(data);
    return { isValid: valid, errors: validation.errors };
}
