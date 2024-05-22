import { annotations } from "../annotations";
import { unit, ontologyTags } from "../defaults";

export const schema = {
    ...unit,
    properties: {
        annotation: {
            type: "object",
            properties: {
                pos: {
                    ...annotations.pos,
                    $id: "adj.annotation.pos",
                    enum: ["adj"]
                },
                lemma: { ...annotations.lemma },
                gender: { ...annotations.gender },
                number: { ...annotations.number },
                degree: { ...annotations.degree }
            },
            required: ["pos", "lemma", "gender", "number"]
        },
        tags: {
            ...ontologyTags
        }
    }
};

export const constraints = [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "adj" } },
    { required: { branch: "gender", leaf: "masc" } },
    { required: { branch: "gender", leaf: "fem" } },
    { required: { branch: "number", leaf: "sing" } },
    { required: { branch: "number", leaf: "plur" } },
    { unique: { branch: "degree" } }
];

// import Joi from "joi";

// const adjSchema = {
//     annotation: Joi.object({
//         pos: Joi.string().valid("adj").required(),
//         lemma: Joi.string().required(),
//         gender: Joi.string().valid("masc", "fem").optional(),
//         number: Joi.string().valid("singular", "plural").optional(),
//         verbform: Joi.string().optional()
//     }).required(),
//     tags: [
//         { branch: "pos", leaf: "adj" },
//         { unique: { branch: "pos" } },
//         { branch: "gender" },
//         { branch: "number" }
//         // { branch: "verbform" },
//     ]
// };

// export default adjSchema;
