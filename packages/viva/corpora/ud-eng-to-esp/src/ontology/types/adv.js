import annotations from "../annotations";
import unit from "../unit";

export const schema = {
    ...unit,
    title: "Adverb",
    description:
        "An adverb is a word that modifies a verb, adjective, determiner, clause, preposition, or sentence. Adverbs typically express manner, place, time, frequency, degree, level of certainty, etc., answering questions such as how?, in what way?, when?, where?, and to what extent?.",
    properties: {
        ...unit.properties,
        annotation: {
            type: "object",
            properties: {
                pos: {
                    ...annotations.pos,
                    $id: "adv.annotation.pos",
                    enum: ["adv"]
                },
                lemma: { ...annotations.lemma },
                degree: { ...annotations.degree },
                prontype: { ...annotations.prontype }
            },
            required: ["pos", "lemma"]
        }
    }
};

export const constraints = [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "adv" } },
    { unique: { branch: "degree" } },
    { unique: { branch: "prontype" } }
];

export const annotationSpace = [
    [
        ["pos", ["adv"]],
        // ["prontype", ["dem"]], // aqui just marked as adv ??
        [
            "lemma",
            [
                "aquí",
                "allí",
                "acá",
                "ahí",
                "allá",
                "entonces",
                "ahora",
                "antes",
                "después",
                "luego",
                "pronto",
                "tarde",
                "temprano",
                "siempre"
            ]
        ]
    ],
    [
        ["pos", ["adv"]],
        ["prontype", ["int"]],
        ["lemma", ["dónde", "cuándo", "cómo"]]
    ],
    [
        ["pos", ["adv"]],
        ["prontype", ["rel"]],
        ["lemma", ["donde", "cuando"]]
    ],
    [
        ["pos", ["adv"]],
        // ["prontype", ["tot"]], // ?? just marked as adv
        ["lemma", ["siempre"]]
    ],
    [
        ["pos", ["adv"]],
        // ["prontype", ["neg"]], // ?? just marked as adv
        ["lemma", ["nunca", "jamás", "tampoco"]]
    ],
    [
        ["pos", ["adv"]],
        // ["degree", ["abs"]], // ?? just marked as adv
        [
            "lemma",
            [
                "muy",
                "bien",
                "exactamente",
                "perfectamente",
                "claramente",
                "rápidamente",
                "lentamente",
                "fuertemente",
                "débilmente",
                "fácilmente",
                "difícilmente",
                "mañana",
                "arriba",
                "abajo",
                "adelante",
                "atrás",
                "lejos",
                "cerca",
                "dentro",
                "fuera",
                "ya"
            ]
        ]
    ]
];

export const lemmas = [];
for (const [branch, leaves] of annotationSpace.flat()) {
    if (branch !== "lemma") continue;
    lemmas.push(...leaves);
}
