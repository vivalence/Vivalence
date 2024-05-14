import Joi from "joi";

const numSchema = {
    annotation: Joi.object({
        pos: Joi.string().valid("num").required(),
        lemma: Joi.string().required(),
        number: Joi.string().valid("singular", "plural").required(),
        numtype: Joi.string().required(),
        gender: Joi.string().optional()
    }).required(),
    tags: [
        { branch: "pos", leaf: "num" },
        { unique: { branch: "pos" } },
        { branch: "numtype" },
        { branch: "number" }
        // { branch: "gender" },
    ]
};

export default numSchema;
