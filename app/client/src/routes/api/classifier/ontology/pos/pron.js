import { annotations } from "../annotations";
import { unit, ontologyTags } from "../defaults";

export const schema = {
    ...unit,
    title: "Pronoun",
    description:
        "A pronoun substitutes for a noun or noun phrase, referring to entities without naming them. Spanish pronouns include personal, reflexive, demonstrative, relative, interrogative, indefinite, and possessive types. They agree in gender, number, and sometimes case with the nouns they replace.",
    properties: {
        ...unit.properties,
        annotation: {
            type: "object",
            properties: {
                pos: {
                    ...annotations.pos,
                    $id: "pron.annotation.pos",
                    enum: ["pron"]
                },
                lemma: { ...annotations.lemma },
                prontype: { ...annotations.prontype },
                person: { ...annotations.person },
                number: { ...annotations.number },
                gender: { ...annotations.gender },
                reflex: { ...annotations.reflex }
            },
            required: ["pos", "lemma", "prontype"],
            allOf: [
                {
                    if: { properties: { prontype: { const: "prs" } }, required: ["prontype"] },
                    then: { required: ["person", "number", "gender"] }
                }
            ]
        }
    }
};

export const constraints = [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "pron" } },
    { required: { branch: "prontype" } },
    {
        condition: {
            if: { required: { branch: "prontype", leaf: "prs" } },
            then: [
                { required: { branch: "gender" } },
                { required: { branch: "person" } },
                { required: { branch: "gender" } }
            ]
        }
    }
];

export const annotationSpace = [
    [
        ["pos", ["pron"]],
        ["prontype", ["prs"]],
        ["number", ["sing", "plur"]],
        ["reflex", [null, "yes"]],
        ["person", ["1", "2", "3"]],
        ["gender", ["masc"]]
    ],
    [
        ["lemma", ["que", "quien", "cual"]],
        ["pos", ["pron"]],
        ["prontype", ["rel"]],
        ["number", ["sing"]]
    ],
    [
        ["lemma", ["qué", "quién", "cuál"]],
        ["pos", ["pron"]],
        ["prontype", ["int"]],
        ["number", ["sing"]]
    ],
    [
        ["lemma", ["este", "ese", "aquel"]],
        ["pos", ["pron"]],
        ["prontype", ["dem"]],
        ["number", ["sing"]],
        ["gender", ["masc"]]
    ],
    [
        ["lemma", ["alguno", "ninguno", "alguien", "nadie"]],
        ["pos", ["pron"]],
        ["prontype", ["ind"]],
        ["number", ["sing"]]
    ],
    [
        ["lemma", ["qué"]],
        ["pos", ["pron"]],
        ["prontype", ["exc"]]
    ],
    [
        ["lemma", ["todo"]],
        ["pos", ["pron"]],
        ["prontype", ["tot"]]
    ],
    [
        ["lemma", ["ninguno"]],
        ["pos", ["pron"]],
        ["prontype", ["neg"]]
    ]
];
