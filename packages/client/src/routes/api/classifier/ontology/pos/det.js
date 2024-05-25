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
                    $id: "det.annotation.pos",
                    enum: ["det"]
                },
                lemma: { ...annotations.lemma },

                gender: { ...annotations.gender },
                number: { ...annotations.number },

                prontype: { ...annotations.prontype },
                definite: { ...annotations.definite },
                poss: { ...annotations.poss }
            },
            required: ["pos", "lemma"]
        }
    }
};

export const constraints = [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "det" } }
];
