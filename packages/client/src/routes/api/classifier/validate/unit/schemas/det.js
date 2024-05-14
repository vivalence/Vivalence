import Joi from "joi";

const detSchema = {
    annotation: Joi.object({
        pos: Joi.string().valid("det").required(),
        lemma: Joi.string().required(),
        number: Joi.string().valid("singular", "plural").required(),
        prontype: Joi.string().required(),
        person: Joi.string().optional(),
        poss: Joi.boolean().optional(),
        definite: Joi.string().optional(),
        gender: Joi.string().optional()
    }).required(),
    tags: [
        { branch: "pos", leaf: "det" },
        { unique: { branch: "pos" } },
        { branch: "prontype" },
        { branch: "number", leaf: "sing" }, // { branch: "number" },
        { branch: "number", leaf: "plur" } // must both be present?
        // { branch: "person" }, // shouldnt be optional
        // { branch: "poss" },
        // { branch: "definite" },
        // { branch: "gender" },
    ]
};

export default detSchema;
