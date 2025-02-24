export const rule = {
  slug: "gender",
  type: "string",
  title: "Gender",
  description:
    "The grammatical gender of a noun or pronoun. Possible values: 'fem' (Feminine: Female gender), 'masc' (Masculine: Male gender).",
  enum: ["fem", "masc"],
};
export const node = {
  slug: "gender",
  name: "gender",
  description: "The grammatical gender of a noun or pronoun.",
  traits: ["CATEGORICAL", "CATEGORICAL"],
  data: {
    CATEGORICAL: [
      {
        slug: "fem",
        name: "Feminine",
        description: "Female gender",
      },
      {
        slug: "masc",
        name: "Masculine",
        description: "Male gender",
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
