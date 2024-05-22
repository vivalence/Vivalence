import { annotations } from "../annotations";
import { unit, ontologyTags } from "../defaults";

export const schema = {
    ...unit,
    properties: {
        annotation: {
            type: "object",
            properties: {
                pos: {
                    ...annotations.pos,
                    $id: "adp.annotation.pos",
                    enum: ["adp"]
                },
                lemma: { ...annotations.lemma }
            },
            required: ["pos", "lemma"]
        },
        tags: {
            ...ontologyTags
        }
    }
};

export const constraints = [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "adp" } }
];
