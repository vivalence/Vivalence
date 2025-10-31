const gestalt = {
  type: "object",
  title: "Unit",
  description:
    "A prototypical Unit schema. this schema is used as a template for all units. These are the implementation independent properties of this domain's units.",
  properties: {
    slug: {
      type: "string",
      description:
        "the unit's slug. functions as a unique identifier for the unit across runtimes.",
    },
    data: {
      type: "object",
      description: "the schema of a unit's data.",
      properties: {
        known: {
          type: "string",
          description: "the translation in the known language",
        },
        learning: {
          type: "string",
          description: "the word by itself, in the language to be learned",
        },
        index: {
          type: ["integer", "null"],
          description:
            "the unit's index in the spanish vocabulary frequency dictionary. lower is more frequent. range: 1-5000",
        },
        example: {
          type: ["object", "null"],
          description:
            "a simple example of how the word is used in a sentence in both languages.",
          properties: {
            learning: {
              type: ["string", "null"],
              description:
                "a very simple example of how the word is used in the language to be learned in the form of a full sentence",
            },
            known: {
              type: ["string", "null"],
              description:
                "a very simple example of how the word is used in the known language in the form of the translated full sentence",
            },
          },
          additionalProperties: false,
          required: ["known", "learning"],
        },
      },
      required: ["known", "learning", "index", "example"],
      additionalProperties: false,
    },
    annotation: {
      type: "object",
      description: "unit annoatition schema",
      properties: {
        // computationall populated at ontology.boot
      },
      required: [],
      additionalProperties: false,
      allOf: [],
    },
  },
  required: ["slug", "data", "annotation"],
  additionalProperties: true,
};
