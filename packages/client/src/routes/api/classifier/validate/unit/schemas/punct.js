import Joi from "joi";

const punctSchema = {
    annotation: Joi.object({
        pos: Joi.string().valid("punct").required(),
        lemma: Joi.string().required(),
        puncttype: Joi.string().optional()
    }).required(),
    tags: [
        { branch: "pos", leaf: "punct" },
        { unique: { branch: "pos" } }
        // { branch: "puncttype" },
    ]
};

export default punctSchema;
