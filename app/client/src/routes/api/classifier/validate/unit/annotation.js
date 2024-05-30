import Ajv from "ajv";
import ajvErrors from "ajv-Errors";

import { pos } from "$classifier/ontology";

const ajv = await (async () => {
    const ajv = new Ajv({ allErrors: true, verbose: true, $data: true });
    ajvErrors(ajv);
    ajv.addKeyword({ keyword: "meta", validate: () => true, errors: false });
    return ajv;
})();

export default async function (unit) {
    const issues = [];

    const { annotation } = unit;
    if (!pos[annotation.pos]) throw new Error(`Schema not found for pos: ${annotation.pos}`);

    const { schema } = pos[annotation.pos];

    const validate = ajv.compile(schema);
    const valid = validate(unit);

    if (!valid) {
        validate.errors.map(buildError).forEach((e) => issues.push(e));
    }
    return { isValid: issues.length === 0, issues };
}

function buildError(error) {
    const path = ["unit", ...error.instancePath.split("/").filter((p) => p !== "")];
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

// const errorTypeInvalid = {
//     instancePath: "/annotation/tense",
//     schemaPath: "#/properties/annotation/properties/tense/enum",
//     keyword: "enum",
//     params: { allowedValues: ["past", "pres", "fut", "imp", "pqp"] },
//     message: "must be equal to one of the allowed values",
//     schema: ["past", "pres", "fut", "imp", "pqp"],
//     parentSchema: {
//         $id: "unit.annotation.tense",
//         type: "string",
//         title: "Tense",
//         description:
//             "The time of action or state expressed by the verb. Possible values: 'past' (Past: An action or state that occurred in the past), 'pres' (Present: An action or state that is currently occurring), 'fut' (Future: An action or state that will occur in the future), 'imp' (Imperfect: A past action or state that was ongoing or repeated), 'pqp' (Pluperfect: An action or state that was completed before another past action).",
//         enum: ["past", "pres", "fut", "imp", "pqp"]
//     },
//     data: "pat"
// };
// const errorTypeRequired = {
//     instancePath: "/annotation",
//     schemaPath: "#/properties/annotation/allOf/0/then/required",
//     keyword: "required",
//     params: { missingProperty: "tense" },
//     message: "must have required property 'tense'",
//     schema: ["tense"],
//     parentSchema: { required: ["tense"] },
//     data: { pos: "verb", lemma: "run", verbform: "fin" }
// };
// const errorTypeForbidden = {
//     instancePath: "/annotation/tense",
//     schemaPath: "#/properties/annotation/allOf/0/else/properties/tense/not",
//     keyword: "not",
//     params: {},
//     message: "must NOT be valid",
//     schema: {},
//     parentSchema: { not: {} },
//     data: "past"
// };
// const errorTypeConditional = {instancePath: "/annotation", schemaPath: "#/properties/annotation/allOf/0/if", keyword: "if", params: { failingKeyword: "then" }, message: 'must match "then" schema', schema: { properties: { verbform: [Object] } }, parentSchema: {if: { properties: [Object] }, then: { required: [Array] }, else: { properties: [Object] }}, data: { pos: "verb", lemma: "run", verbform: "fin" }};
