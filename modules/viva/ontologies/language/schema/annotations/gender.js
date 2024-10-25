export const gender = {
  $id: "unit.annotation.gender",
  type: "string",
  title: "Gender",

  description:
    "The grammatical gender of a noun or pronoun. Possible values: 'fem' (Feminine: Female gender), 'masc' (Masculine: Male gender).",
  enum: ["fem", "masc"],
};

export const meta = {
  slug: "gender",
  config: {
    tags: {
      "gender:*": {
        traits: ["LEARNABLE"],
        data: {
          LEARNABLE: {
            type: "BOOLEAN",
          },
        },
      },
      "gender:fem": {
        traits: ["LEARNABLE"],
        data: {
          LEARNABLE: {
            flavor: "RELATIONAL",
          },
        },
      },
      "gender:masc": {
        traits: ["LEARNABLE"],
        data: {
          LEARNABLE: {
            flavor: "RELATIONAL",
          },
        },
      },
    },
  },
  enums: {
    fem: { enum: "fem", title: "Feminine", description: "" },
    masc: { enum: "masc", title: "Masculine", description: "" },
  },
};
