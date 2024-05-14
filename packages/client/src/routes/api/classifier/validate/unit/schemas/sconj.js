import Joi from "joi";

const sconjSchema = {
    annotation: Joi.object({
        pos: Joi.string().valid("sconj").required(),
        lemma: Joi.string().required()
    }).required(),
    tags: [{ branch: "pos", leaf: "sconj" }, { unique: { branch: "pos" } }]
};

export default sconjSchema;
