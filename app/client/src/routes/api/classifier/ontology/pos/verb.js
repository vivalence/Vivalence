import { annotations } from "../annotations";
import { unit, ontologyTags } from "../defaults";

export const schema = {
    ...unit,
    properties: {
        ...unit.properties,
        english: {
            type: "string",
            description:
                "the english translation. if conjugated, then including the corresponding pronoun - e.g. 'I eat', 'he/she/it ate', 'you (all) will eat'. if verb is ambiguous, then includes clarifying reference - e.g. to have (possession) vs to have (auxiliary)."
        },
        annotation: {
            type: "object",
            properties: {
                pos: {
                    ...annotations.pos,
                    $id: "verb.annotation.pos",
                    enum: ["verb", "aux"]
                },
                lemma: { ...annotations.lemma },
                verbform: { ...annotations.verbform },
                tense: { ...annotations.tense },
                mood: { ...annotations.mood },
                person: { ...annotations.person },
                gender: { ...annotations.gender },
                number: { ...annotations.number },
                aspect: { ...annotations.aspect }
            },
            required: ["pos", "lemma", "verbform"],
            allOf: [
                {
                    if: { properties: { verbform: { const: "fin" } }, required: ["verbform"] },
                    then: {
                        required: ["tense", "mood", "person", "number", "aspect"],
                        properties: { gender: { not: {} } }
                    }
                },
                {
                    if: { properties: { verbform: { const: "inf" } }, required: ["verbform"] },
                    then: {
                        properties: {
                            tense: { not: {} },
                            mood: { not: {} },
                            person: { not: {} },
                            number: { not: {} },
                            aspect: { not: {} },
                            gender: { not: {} }
                        }
                    }
                },
                {
                    if: { properties: { verbform: { const: "part" } }, required: ["verbform"] },
                    then: {
                        required: ["gender", "number"],
                        properties: {
                            tense: { not: {} },
                            mood: { not: {} },
                            person: { not: {} },
                            aspect: { not: {} }
                        }
                    }
                },
                {
                    if: { properties: { verbform: { const: "ger" } }, required: ["verbform"] },
                    then: {
                        properties: {
                            tense: { not: {} },
                            mood: { not: {} },
                            person: { not: {} },
                            number: { not: {} },
                            aspect: { not: {} },
                            gender: { not: {} }
                        }
                    }
                }
            ]
        }
    }
};

export const constraints = [
    { unique: { branch: "pos" } },
    { unique: { branch: "lemma" } },
    { unique: { branch: "verbform" } },
    { unique: { branch: "tense" } },
    { unique: { branch: "mood" } },
    { unique: { branch: "person" } },
    { unique: { branch: "aspect" } },
    {
        some: [
            { required: { branch: "pos", leaf: "verb" } },
            { required: { branch: "pos", leaf: "aux" } }
        ]
    },
    { required: { branch: "verbform", leaf: "fin" } },
    {
        condition: {
            if: { required: { branch: "verbform", leaf: "fin" } },
            then: [
                { required: { branch: "mood" } },
                { required: { branch: "tense" } },
                { required: { branch: "mood" } },
                { required: { branch: "person" } },
                { required: { branch: "number" } },
                { required: { branch: "aspect" } },
                { unique: { branch: "number" } },
                { forbidden: { branch: "gender" } }
            ]
        }
    },
    {
        condition: {
            if: { required: { branch: "verbform", leaf: "inf" } },
            then: [
                { forbidden: { branch: "tense" } },
                { forbidden: { branch: "mood" } },
                { forbidden: { branch: "person" } },
                { forbidden: { branch: "number" } },
                { forbidden: { branch: "aspect" } },
                { forbidden: { branch: "gender" } }
            ]
        }
    },
    {
        condition: {
            if: { required: { branch: "verbform", leaf: "part" } },
            then: [
                { required: { branch: "gender", leaf: "masc" } },
                { required: { branch: "gender", leaf: "fem" } },
                { required: { branch: "number", leaf: "sing" } },
                { required: { branch: "number", leaf: "plur" } },
                { forbidden: { branch: "tense" } },
                { forbidden: { branch: "mood" } },
                { forbidden: { branch: "person" } },
                { forbidden: { branch: "aspect" } }
            ]
        }
    },
    {
        condition: {
            if: { required: { branch: "verbform", leaf: "ger" } },
            then: [
                { forbidden: { branch: "tense" } },
                { forbidden: { branch: "mood" } },
                { forbidden: { branch: "person" } },
                { forbidden: { branch: "number" } },
                { forbidden: { branch: "aspect" } },
                { forbidden: { branch: "gender" } }
            ]
        }
    }
];

// const verbLemmas = [];
// export const annotationSpace = [
//     [
//         ["lemma", verbLemmas],
//         ["pos", ["verb"]],
//         ["verbform", ["fin"]],
//         ["mood", ["ind"]],
//         ["tense", ["pres", "past", "fut", "imp"]],
//         ["number", ["sing", "plur"]],
//         ["person", ["1", "2", "3"]]
//     ],
//     [
//         ["lemma", verbLemmas],
//         ["pos", ["verb"]],
//         ["verbform", ["inf", "ger", "part"]]
//     ]
// ];
