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
                    $id: "punct.annotation.pos",
                    enum: ["punct"]
                },
                lemma: { ...annotations.lemma }
            },
            required: ["pos", "lemma"]
        }
    }
};
export const constraints = [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "punct" } }
];
