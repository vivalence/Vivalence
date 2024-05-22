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
                    $id: "sconj.annotation.pos",
                    enum: ["sconj"]
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
    { required: { branch: "pos", leaf: "sconj" } }
];

// import Joi from "joi";

// const sconjSchema = {
//     annotation: Joi.object({
//         pos: Joi.string().valid("sconj").required(),
//         lemma: Joi.string().required()
//     }).required(),
//     tags: [{ branch: "pos", leaf: "sconj" }, { unique: { branch: "pos" } }]
// };

// export default sconjSchema;
