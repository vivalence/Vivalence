import Joi from "joi";

const intjSchema = {
    annotation: Joi.object({
        pos: Joi.string().valid("intj").required(),
        lemma: Joi.string().required()
    }).required(),
    tags: [{ branch: "pos", leaf: "intj" }, { unique: { branch: "pos" } }]
};

export default intjSchema;
