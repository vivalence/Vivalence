import Joi from "joi";

const adpSchema = {
    annotation: Joi.object({
        pos: Joi.string().valid("adp").required(),
        lemma: Joi.string().required()
    }).required(),
    tags: [{ branch: "pos", leaf: "adp" }, { unique: { branch: "pos" } }]
};

export default adpSchema;
