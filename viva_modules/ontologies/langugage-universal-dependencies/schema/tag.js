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
        enum: ["ONTOLOGICAL", "LEARNABLE", "COMPLETABLE", "DEPENDENCY", "STRUCTURAL"],
      },
      slug: {
        type: "string",
        description:
          "the tags's slug. functions as a unique identifier for the tags across runtimes.",
      },
      data: {
        type: "object",
      },
    },
    required: ["slug", "data", "traits"],
    additionalProperties: true,
  };
  return schema;
};
