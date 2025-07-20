// export const rule = {slug: "prepcase", type: "string", title: "Prepositional Case", description: "Indicates the prepositional usage of a pronoun.", enum: ["pre", "npr"],};

// export const meta = {slug: "prepcase", enums: {pre: {enum: "pre", title: "Prepositional Case", description: "This word form must be used after a preposition.",}, npr: {enum: "npr", title: "Non-prepositional Case", description: "This word form must not be used after a preposition.",},},};
export const node = {
  slug: "prepcase",
  name: "prepositional case",
  description: "Indicates the prepositional usage of a pronoun.",
  traits: ["CATEGORICAL", "CATEGORICAL"],
  data: {
    CATEGORICAL: [
      {
        slug: "pre",
        name: "Prepositional Case",
        description: "This word form must be used after a preposition",
      },
      {
        slug: "npr",
        name: "Non-prepositional Case",
        description: "This word form must not be used after a preposition",
      },
    ],
  },
};
