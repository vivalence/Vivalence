// export const rule = {slug: "gender", type: "string", title: "Gender", description: "The grammatical gender of a noun or pronoun. Possible values: 'fem' (Feminine: Female gender), 'masc' (Masculine: Male gender).", enum: ["fem", "masc"],};
export const node = {
  slug: "gender",
  name: "gender",
  description: "The grammatical gender of a noun or pronoun.",
  traits: ["CATEGORICAL", "LEARNABLE"],
  data: {
    LEARNABLE: { driver: "BOOLEAN", type: "INDIVIDUAL" },
    CATEGORICAL: [
      {
        slug: "fem",
        name: "Feminine",
        description: "Female gender",
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { driver: "BAYESIAN", type: "RELATIONAL" } },
      },
      {
        slug: "masc",
        name: "Masculine",
        description: "Male gender",
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { driver: "BAYESIAN", type: "RELATIONAL" } },
      },
      {
        slug: "neut",
        name: "Neutral",
        description: "Neutral gender",
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { driver: "BAYESIAN", type: "RELATIONAL" } },
      },
    ],
  },
};

// export const meta = {
//   slug: "gender",
//   enums: {
//     fem: { enum: "fem", title: "Feminine", description: "" },
//     masc: { enum: "masc", title: "Masculine", description: "" },
//   },
// };
