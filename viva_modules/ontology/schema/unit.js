// allOf: Object.values(PoS).map((pos) => {const statement = {if: {properties: {pos: { const: pos.schema.properties.annotation.properties.pos.enum }}}, then: {required: pos.schema.properties.annotation.required}}; if (pos.schema.properties.annotation.allOf) {statement.then.allOf = pos.schema.properties.annotation.allOf;} return statement;})

export default ((schema) => {
  schema.unit = {
    type: "object",
    description: "unit.data schema",
    properties: {
      known: { type: "string", description: "the translation in the known language" },
      learning: {
        type: "string",
        description: "the word by itself, in the language to be learned",
      },
      index: {
        type: "integer",
        description:
          "the unit's index in the spanish vocabulary frequency dictionary. lower is more frequent. range: 1-5000",
      },
      example: {
        learning: {
          type: "string",
          description:
            "a very simple example of how the word is used in the language to be learned in the form of a full sentence",
        },
        known: {
          type: "string",
          description:
            "a very simple example of how the word is used in the known language in the form of the translated full sentence",
        },
      },
      // usageInEnglish: {type: "string", description: "a very simple example of how the word is used in english",}, usageInSpanish: {type: "string", description: "a very simple example of how the word is used in spanish",},
      annotation: {
        type: "object",
        properties: { ...schema.annotations },
        required: ["pos", "lemma"],
      },
    },
    required: ["known", "learning", "annotation"],
  };
  return schema;
});
