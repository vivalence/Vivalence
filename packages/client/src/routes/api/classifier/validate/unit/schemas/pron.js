import Joi from "joi";

const pronSchema = {
    annotation: Joi.object({
        pos: Joi.string().valid("pron").required(),
        lemma: Joi.string().required(),
        number: Joi.string().valid("singular", "plural").required(),
        prontype: Joi.string().required(),
        gender: Joi.string().optional(),
        person: Joi.string().optional()
    }).required(),
    tags: [
        { branch: "pos", leaf: "pron" },
        { unique: { branch: "pos" } },
        { branch: "prontype" },
        { branch: "number" }
        // { branch: "gender" },
        // { branch: "person" },
    ]
};

export default pronSchema;
