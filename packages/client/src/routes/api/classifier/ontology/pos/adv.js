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
