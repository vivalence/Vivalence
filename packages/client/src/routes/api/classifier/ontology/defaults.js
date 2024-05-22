export const unit = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {}
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
