import Joi from "joi";

const adjSchema = {
    annotation: Joi.object({
        pos: Joi.string().valid("adj").required(),
        lemma: Joi.string().required(),
        gender: Joi.string().valid("masc", "fem").optional(),
        number: Joi.string().valid("singular", "plural").optional(),
        verbform: Joi.string().optional()
    }).required(),
    tags: [
        { branch: "pos", leaf: "adj" },
        { unique: { branch: "pos" } },
        { branch: "gender" },
        { branch: "number" }
        // { branch: "verbform" },
    ]
};

export default adjSchema;
