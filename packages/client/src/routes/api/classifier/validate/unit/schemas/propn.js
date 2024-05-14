import Joi from "joi";

const propnSchema = {
    annotation: Joi.object({
        pos: Joi.string().valid("propn").required(),
        lemma: Joi.string().required()
    }).required(),
    tags: [{ branch: "pos", leaf: "propn" }, { unique: { branch: "pos" } }]
};

export default propnSchema;
