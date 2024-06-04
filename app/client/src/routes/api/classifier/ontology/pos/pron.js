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

                prepcase: { ...annotations.prepcase },
                reflex: { ...annotations.reflex }
            },
            required: ["pos", "lemma", "prontype"],
            allOf: [
                {
                    if: { properties: { prontype: { const: "prs" } }, required: ["prontype"] },
                    then: {
                        required: ["person", "number"]
                    }
                }
            ]
        }
    }
};

export const constraints = [
    { unique: { branch: "pos" } },
    { unique: { branch: "prontype" } },
    { unique: { branch: "prepcase" } },
    { unique: { branch: "reflex" } },
    { unique: { branch: "person" } },
    { unique: { branch: "number" } },

    { required: { branch: "pos", leaf: "pron" } },
    { required: { branch: "prontype" } },
    {
        condition: {
            if: { required: { branch: "prontype", leaf: "prs" } },
            then: [
                { required: { branch: "person" } },
                { required: { branch: "number" } },
                { unique: { branch: "reflex" } },
                { unique: { branch: "prepcase" } }
            ]
        }
    }
];

export const annotationSpace = [
    [
        ["pos", ["pron"]],
        ["prontype", ["prs"]],
        ["number", ["sing", "plur"]],
        ["person", ["1", "2", "3"]],
        ["gender", ["masc"]]
    ],
    [
        ["pos", ["pron"]],
        ["prontype", ["prs"]],
        ["prepcase", ["pre", "npr"]],
        ["number", ["sing", "plur"]],
        ["person", ["1", "2", "3"]],
        ["gender", ["masc"]]
    ],
    [
        ["pos", ["pron"]],
        ["prontype", ["prs"]],
        ["reflex", ["yes"]],
        ["number", ["sing", "plur"]],
        ["person", ["1", "2", "3"]],
        ["gender", ["masc"]]
    ],
    [
        ["lemma", ["que", "quien", "cual"]],
        ["pos", ["pron"]],
        ["prontype", ["rel"]],
        ["number", ["sing"]],
        ["gender", ["masc"]]
    ],
    [
        ["lemma", ["qué", "quién", "cuál"]],
        ["pos", ["pron"]],
        ["prontype", ["int"]],
        ["number", ["sing"]],
        ["gender", ["masc"]]
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
        ["number", ["sing"]],
        ,
        ["gender", ["masc"]]
    ],
    [
        ["lemma", ["qué"]],
        ["pos", ["pron"]],
        ["prontype", ["exc"]]
    ]
    // [["lemma", ["todo"]], ["pos", ["pron"]], ["prontype", ["tot"]]],
    // [["lemma", ["ninguno"]], ["pos", ["pron"]], ["prontype", ["neg"]]]
];

export const lemmas = [];
for (const [branch, leaves] of annotationSpace.flat()) {
    if (branch !== "lemma") continue;
    lemmas.push(...leaves);
}

// should here reside the logic for unit/fromAnnotation?
