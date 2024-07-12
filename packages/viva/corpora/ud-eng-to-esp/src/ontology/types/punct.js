import annotations from "../annotations";
import unit from "../unit";

export const schema = {
    ...unit,
    title: "Punctuation",
    description: "Punctuation marks",
    properties: {
        ...unit.properties,
        annotation: {
            type: "object",
            properties: {
                pos: {
                    ...annotations.pos,
                    $id: "punct.annotation.pos",
                    enum: ["punct"]
                },
                lemma: { ...annotations.lemma }
                // puncttype: { ...annotations.puncttype }
            },
            required: ["pos", "lemma"]
        }
    }
};
export const constraints = [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "punct" } }
];

export const annotationSpace = [
    [
        ["pos", ["punct"]],
        ["lemma", [".", ",", "!", "¡", "?", "¿"]]
    ]
];

// export const lemmas = [];
// for (const [branch, leaves] of annotationSpace.flat()) {
//     if (branch !== "lemma") continue;
//     lemmas.push(...leaves);
// }
