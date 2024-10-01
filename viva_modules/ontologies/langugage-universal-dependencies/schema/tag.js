// not yet implemented
// defines the traits implemented by the tag

export default (schema) => {
  schema.tag = {
    type: "object",
    title: "Tag",
    description: "",
    properties: {
      traits: {
        type: "array",
        description: "the traits implemented by the tag",
      },
      slug: {
        type: "string",
        description:
          "the unit's slug. functions as a unique identifier for the unit across runtimes.",
      },
      data: {
        type: "object",
        description: "the schema of a unit's data.",
        properties: {},
        required: ["known", "learning", "index", "example"],
        additionalProperties: false,
      },
    },
    required: ["slug", "data", "traits"],
    additionalProperties: false,
  };
  return schema;
};
