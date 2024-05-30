import { annotations } from "../annotations";
import { unit, ontologyTags } from "../defaults";

export const schema = {
    ...unit,
    title: "Determiner",
    description:
        "Determiners express the reference of a noun phrase in context, modifying nouns to indicate definiteness, specificity, and quantity. In Spanish, they agree in gender and number with the noun they modify. Categories include articles, demonstratives, possessives, and quantifiers.",
    properties: {
        ...unit.properties,
        annotation: {
            type: "object",
            properties: {
                pos: {
                    ...annotations.pos,
                    $id: "det.annotation.pos",
                    enum: ["det"]
                },
                lemma: { ...annotations.lemma },

                prontype: { ...annotations.prontype },
                definite: { ...annotations.definite },
                poss: { ...annotations.poss },

                gender: { ...annotations.gender },
                number: { ...annotations.number }
            },
            required: ["pos", "lemma", "prontype", "gender", "number"],
            allOf: [
                {
                    if: { properties: { prontype: { const: "art" } }, required: ["prontype"] },
                    then: { required: ["definite"] }
                },
                {
                    if: { properties: { prontype: { const: "prs" } }, required: ["prontype"] },
                    then: { required: ["poss"] }
                }
            ]
        }
    }
};

export const constraints = [
    { unique: { branch: "pos" } },
    { unique: { branch: "prontype" } },
    { required: { branch: "pos", leaf: "det" } },
    { required: { branch: "prontype" } },
    {
        condition: {
            if: { required: { branch: "prontype", leaf: "art" } },
            then: [{ required: { branch: "definite" } }]
        }
    },
    {
        condition: {
            if: { required: { branch: "prontype", leaf: "prs" } },
            then: [{ required: { branch: "poss" } }]
        }
    }
];

export const annotationSpace = [
    [
        ["pos", ["det"]],
        ["prontype", ["art"]],
        ["definite", ["def", "ind"]],
        ["number", ["sing"]],
        ["gender", ["masc"]]
    ],
    [
        ["lemma", ["este", "ese", "aquel"]],
        ["pos", ["det"]],
        ["prontype", ["dem"]],
        ["number", ["sing"]],
        ["gender", ["masc"]]
    ],
    [
        ["lemma", ["mi", "tu", "su", "nuestro", "vuestro", "mío", "tuyo", "suyo"]],
        ["pos", ["det"]],
        ["prontype", ["prs"]],
        ["poss", ["yes"]],
        ["number", ["sing"]],
        ["gender", ["masc"]]
    ],
    [
        ["lemma", ["todo"]],
        ["pos", ["det"]],
        ["prontype", ["tot"]],
        ["number", ["sing"]],
        ["gender", ["masc"]]
    ],
    [
        [
            "lemma",
            [
                "mucho",
                "poco",
                "algún",
                "cada",
                "otro",
                "cualquier",
                "demasiado",
                "vario",
                "suficiente",
                "tanto",
                "alguno"
            ]
        ],
        ["pos", ["det"]],
        ["prontype", ["ind"]],
        ["number", ["sing"]],
        ["gender", ["masc"]]
    ],
    [
        ["lemma", ["ninguno"]],
        ["pos", ["det"]],
        ["prontype", ["neg"]],
        ["number", ["sing"]],
        ["gender", ["masc"]]
    ]
];
