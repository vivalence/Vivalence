import annotations from "./annotations";

const unit = {
    type: "object",
    description: "unit.data schema",
    properties: {
        spanish: { type: "string", description: "the word by itself, in spanish" },
        english: { type: "string", description: "the english translation" },
        index: {
            type: "integer",
            description:
                "the unit's index in the spanish vocabulary frequency dictionary. lower is more frequent. range: 1-5000"
        },
        usageInEnglish: {
            type: "string",
            description: "a very simple example of how the word is used in english"
        },
        usageInSpanish: {
            type: "string",
            description: "a very simple example of how the word is used in spanish"
        },
        annotation: {
            type: "object",
            properties: {
                ...annotations
            },
            required: ["pos", "lemma"]
            // allOf: Object.values(PoS).map((pos) => {
            //     // wtf is this?
            //     const statement = {
            //         if: {
            //             properties: {
            //                 pos: { const: pos.schema.properties.annotation.properties.pos.enum }
            //             }
            //         },
            //         then: {
            //             required: pos.schema.properties.annotation.required
            //         }
            //     };
            //     if (pos.schema.properties.annotation.allOf) {
            //         statement.then.allOf = pos.schema.properties.annotation.allOf;
            //     }
            //     return statement;
            // })
        }
    },
    required: ["spanish", "english", "annotation"]
};

export default unit;
