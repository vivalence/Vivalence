import { annotations } from "../annotations";
import { unit, ontologyTags } from "../defaults";

export const schema = {
    ...unit,
    properties: {
        ...unit.properties,
        annotation: {
            type: "object",
            properties: {
                pos: {
                    ...annotations.pos,
                    $id: "intj.annotation.pos",
                    enum: ["intj"]
                },
                lemma: { ...annotations.lemma }
            },
            required: ["pos", "lemma"]
        }
    }
};

export const constraints = [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "intj" } }
];

// import Joi from "joi";

// const intjSchema = {
//     annotation: Joi.object({
//         pos: Joi.string().valid("intj").required(),
//         lemma: Joi.string().required()
//     }).required(),
//     tags: [{ branch: "pos", leaf: "intj" }, { unique: { branch: "pos" } }]
// };

// export default intjSchema;
