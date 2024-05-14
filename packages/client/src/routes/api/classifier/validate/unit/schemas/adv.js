import Joi from "joi";

const advSchema = {
    annotation: Joi.object({
        pos: Joi.string().valid("adv").required(),
        lemma: Joi.string().required(),
        polarity: Joi.string().optional(),
        prontype: Joi.string().optional(),
        degree: Joi.string().optional()
    }).required(),
    tags: [
        { branch: "pos", leaf: "adv" },
        { unique: { branch: "pos" } }
        // { branch: "polarity" },
        // { branch: "prontype" },
        // { branch: "degree" },
    ]
};

export default advSchema;
