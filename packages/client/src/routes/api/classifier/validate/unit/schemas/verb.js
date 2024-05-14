import Joi from "joi";

const verbSchema = {
    annotation: Joi.object({
        pos: Joi.string().valid("verb", "aux").required(),
        lemma: Joi.string().required(),
        verbform: Joi.string().required(),
        tense: Joi.string().optional(),
        mood: Joi.string().optional(),
        person: Joi.string().optional(),
        number: Joi.string().optional(),
        aspect: Joi.string().optional()
    }).required(),
    tags: [
        {
            oneOf: [
                { branch: "pos", leaf: "verb" },
                { branch: "pos", leaf: "aux" }
            ]
        },
        { unique: { branch: "pos" } },
        { branch: "verbform" },
        {
            if: {
                condition: [{ branch: "verbform", leaf: "fin" }],
                then: [
                    { branch: "tense" },
                    { branch: "mood" },
                    { branch: "person" },
                    { branch: "number" },
                    { branch: "aspect" }
                ],
                else: [
                    {
                        none: [
                            { branch: "tense" },
                            { branch: "mood" },
                            { branch: "person" },
                            { branch: "number" },
                            { branch: "aspect" }
                        ]
                    }
                ]
            }
        }
    ]
};

export default verbSchema;
