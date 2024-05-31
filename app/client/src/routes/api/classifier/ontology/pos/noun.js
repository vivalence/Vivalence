import { annotations } from "../annotations";
import { unit, ontologyTags } from "../defaults";

export const schema = {
    ...unit,
    properties: {
        ...unit.properties,
        annotation: {
            type: "object",
            properties: {
                pos: {
                    ...annotations.pos,
                    $id: "noun.annotation.pos",
                    enum: ["noun", "propn"]
                },
                lemma: { ...annotations.lemma },
                gender: { ...annotations.gender },
                number: { ...annotations.number }
            },
            required: ["pos", "lemma", "gender", "number"]
        }
    }
};

export const constraints = [
    { unique: { branch: "pos" } },
    {
        some: [
            { required: { branch: "pos", leaf: "noun" } },
            { required: { branch: "pos", leaf: "propn" } }
        ]
    },
    { unique: { branch: "gender" } },
    {
        some: [
            { required: { branch: "gender", leaf: "masc" } },
            { required: { branch: "gender", leaf: "fem" } }
        ]
    },
    { required: { branch: "number", leaf: "sing" } },
    { required: { branch: "number", leaf: "plur" } }
];

// martes AdvType=Tim

// export const lemmas = [];
// for (const [branch, leaves] of annotationSpace.flat()) {
//     if (branch !== "lemma") continue;
//     lemmas.push(...leaves);
// }
