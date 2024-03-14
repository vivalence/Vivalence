import Ajv from "ajv";

const ajv = new Ajv();

export default function ({ schema }) {
    const validate = ajv.compile(schema);
    return (candidate) => {
        const valid = validate(candidate);
        if (!valid) return { errors: validate.errors, output: false, success: false };
        else return { errors: null, output: candidate, success: true };
    };
}
