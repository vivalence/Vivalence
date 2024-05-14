import Joi from "joi";

const cconjSchema = {
    annotation: Joi.object({
        pos: Joi.string().valid("cconj").required(),
        lemma: Joi.string().required()
    }).required(),
    tags: [{ branch: "pos", leaf: "cconj" }, { unique: { branch: "pos" } }]
};

export default cconjSchema;
