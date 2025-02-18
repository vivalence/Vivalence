// allOf: Object.values(PoS).map((pos) => {const statement = {if: {properties: {pos: { const: pos.schema.properties.annotation.properties.pos.enum }}}, then: {required: pos.schema.properties.annotation.required}}; if (pos.schema.properties.annotation.allOf) {statement.then.allOf = pos.schema.properties.annotation.allOf;} return statement;})

// really maybe more of a domain thing.
// actually kind of mixed.
// patches or applies domain defaults.
// in this case, patches.

export default (schema) => {
  // should be classes.
  // schema.entities.unit.annotation={class,schema}
  // schema.entities.unit.data={class,schema}
  // but how do i define the unit, with the embeddable not yet defined?
  // i cant. at least for now.
  // i define the schema once in the beginnign of the mikro clients lifecycle, the daemon owns the client, no play.

  schema.entities.unit = {
    // type: "object", title: "Unit", description: "A prototypical Unit schema. this schema is used as a template for all units. These are the implementation independent properties of this domain's units.", properties: {
    // slug: {type: "string", description: "the unit's slug. functions as a unique identifier for the unit across runtimes.",},
    data: {
      // type: "object", description: "the schema of a unit's data.",
      // properties: {
      known: { type: "string", description: "the translation in the known language" },
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
        description: "a simple example of how the word is used in a sentence in both languages.",
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
        // additionalProperties: false, required: ["known", "learning"],
        // },
      },
      // required: ["known", "learning", "index", "example"], additionalProperties: false,
    },
    annotation: {
      type: "object",
      description: "unit.annoatition schema",
      properties: {
        ...schema.annotations,
      },
      // required: ["pos", "lemma"], additionalProperties: false,
    },
    // },
    // required: ["slug", "data", "annotation"],
    // additionalProperties: false,
  };
  return schema;
};
// schema.entities.tag.data[...tag.TRAITS[]]
