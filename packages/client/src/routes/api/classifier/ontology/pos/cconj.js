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
                    $id: "cconj.annotation.pos",
                    enum: ["cconj"]
                },
                lemma: { ...annotations.lemma }
            },
            required: ["pos", "lemma"]
        },
        tags: {
            ...ontologyTags
        }
    }
};

export const constraints = [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "cconj" } }
];

// import Joi from "joi";

// const cconjSchema = {
//     annotation: Joi.object({
//         pos: Joi.string().valid("cconj").required(),
//         lemma: Joi.string().required()
//     }).required(),
//     tags: [{ branch: "pos", leaf: "cconj" }, { unique: { branch: "pos" } }]
// };

// export default cconjSchema;
