export const unit = {
    // $schema: "https://json-schema.org/draft-7/schema",
    // $schema: "https://json-schema.org/draft/2020-12/schema",
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
        }
    },
    required: ["spanish", "english", "annotation"]
};

export const ontologyTags = {
    type: "array",
    items: {
        type: "object",
        properties: {
            branch: { type: "string" },
            leaf: { type: "string" }
        },
        required: ["branch", "leaf"]
    }
};
