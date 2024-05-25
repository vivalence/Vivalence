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
                    $id: "num.annotation.pos",
                    enum: ["num"]
                },
                lemma: { ...annotations.lemma },
                gender: { ...annotations.gender },
                number: { ...annotations.number },
                numtype: { ...annotations.numtype }
            },
            required: ["pos", "lemma", "numtype"]
        }
    }
};

export const constraints = [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "num" } },
    { unique: { branch: "gender" } },
    { unique: { branch: "number" } },
    { unique: { branch: "numtype" } }
];
