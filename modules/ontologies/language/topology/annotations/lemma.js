export const rule = {
  slug: "lemma",
  type: "string",
  title: "Lemma",
  description: "The canonical form or base form of a word.",
  // enum: []
};

export const node = {
  slug: "lemma",
  name: "lemma",
  description: "The canonical form or base form of a word.",
  traits: ["CATEGORICAL", "CATEGORICAL"], // FREE ?
  data: {
    CATEGORICAL: [],
  },
};

// export const meta = {
//   slug: "lemma",
// };
