export const prepcase = {
  $id: "unit.annotation.prepcase",
  type: "string",
  title: "Prepositional Case",
  description: "Indicates the prepositional usage of a pronoun.",
  enum: ["pre", "npr"],
};

export const meta = {
  enums: {
    pre: {
      enum: "pre",
      title: "Prepositional Case",
      description: "This word form must be used after a preposition.",
    },
    npr: {
      enum: "npr",
      title: "Non-prepositional Case",
      description: "This word form must not be used after a preposition.",
    },
  },
};
