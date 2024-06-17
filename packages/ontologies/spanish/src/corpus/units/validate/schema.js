export default async function ({ annotation }, { ontology }) {
    if (!ontology.units[annotation.pos])
        throw new Error(`Schema not found for pos: ${annotation.pos}`);

    const { schema } = ontology.units[annotation.pos];

    const { isValid, errors } = validate(schema.properties.annotation, annotation);

    const issues = [];
    if (!isValid) {
        errors.map(buildError).forEach((e) => issues.push(e));
    }
    return { isValid: issues.length === 0, issues };
}

function buildError(error) {
    const path = ["unit", "annotation", ...error.instancePath.split("/").filter((p) => p !== "")];
    const context = { error };
    if (error.keyword === "enum") {
        return {
            message: `annotation invalid: ${error.message}`,
            path,
            violation: "invalid",
            context
        };
    } else if (error.keyword === "required") {
        return {
            message: `annotation missing: ${error.message}`,
            path: [...path, error.params.missingProperty],
            violation: "required",
            context
        };
    } else if (error.keyword === "not") {
        return {
            message: `annotation invalid: ${error.instancePath} ${error.message}`,
            path,
            violation: "forbidden",
            context
        };
    } else if (error.keyword === "additionalProperties") {
        return {
            message: `annotation invalid: ${error.instancePath} ${error.message}`,
            path: [...path, error.params.additionalProperty],
            violation: "forbidden",
            context
        };
    } else if (error.keyword === "if") {
        return {
            message: `annotation invalid: ${error.instancePath} ${error.message}`,
            path,
            violation: "conditional",
            context
        };
    }
    const unknownError = {
        message: `unknown error: ${error.instancePath} ${error.message}`,
        path,
        violation: "unknown",
        context
    };
    return unknownError;
}
