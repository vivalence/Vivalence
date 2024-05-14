import Joi from "joi";

export default {
    annotation: Joi.object({
        pos: Joi.string().valid("noun").required(),
        lemma: Joi.string(),
        gender: Joi.string().valid("fem", "masc").required(),
        number: Joi.string().valid("sing", "plur").required()
    }).required(),
    tags: [
        { branch: "pos", leaf: "noun" },
        { unique: { branch: "pos" } },
        { not: { leaf: "propn" } },
        { branch: "number", leaf: "sing" },
        { branch: "number", leaf: "plur" },
        {
            oneOf: [
                { branch: "gender", leaf: "masc" },
                { branch: "gender", leaf: "fem" }
            ]
        }
    ]
};
