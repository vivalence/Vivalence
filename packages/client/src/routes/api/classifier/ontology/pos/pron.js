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
                    $id: "pron.annotation.pos",
                    enum: ["pron"]
                },
                lemma: { ...annotations.lemma },
                gender: { ...annotations.gender },
                number: { ...annotations.number },
                person: { ...annotations.person },
                prontype: { ...annotations.prontype }
            },
            required: ["pos", "lemma", "prontype"],
            allOf: [
                {
                    if: { properties: { prontype: { const: "prs" } } },
                    then: { required: ["person", "number"] }
                },
                {
                    if: { properties: { prontype: { const: "dem" } } },
                    then: { required: ["gender", "number"] }
                },
                {
                    if: { properties: { prontype: { const: "ref" } } },
                    then: { required: ["person", "number"] }
                },
                {
                    if: { properties: { prontype: { const: "int" } } },
                    then: { required: ["number"] }
                },
                {
                    if: { properties: { prontype: { const: "rel" } } },
                    then: { required: ["number"] }
                },
                {
                    if: { properties: { prontype: { const: "ind" } } },
                    then: { required: ["number"] }
                },
                {
                    if: { properties: { prontype: { const: "neg" } } },
                    then: { required: ["number"] }
                }
            ]
        },
        tags: {
            ...ontologyTags
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
            then: [{ required: { branch: "person" } }, { required: { branch: "number" } }]
        }
    },
    {
        condition: {
            if: { required: { branch: "prontype", leaf: "dem" } },
            then: [{ required: { branch: "gender" } }, { required: { branch: "number" } }]
        }
    },
    {
        condition: {
            if: { required: { branch: "prontype", leaf: "ref" } },
            then: [{ required: { branch: "person" } }, { required: { branch: "number" } }]
        }
    },
    {
        condition: {
            if: { required: { branch: "prontype", leaf: "int" } },
            then: [{ required: { branch: "number" } }]
        }
    },
    {
        condition: {
            if: { required: { branch: "prontype", leaf: "rel" } },
            then: [{ required: { branch: "number" } }]
        }
    },
    {
        condition: {
            if: { required: { branch: "prontype", leaf: "ind" } },
            then: [{ required: { branch: "number" } }]
        }
    },
    {
        condition: {
            if: { required: { branch: "prontype", leaf: "neg" } },
            then: [{ required: { branch: "number" } }]
        }
    }
];
