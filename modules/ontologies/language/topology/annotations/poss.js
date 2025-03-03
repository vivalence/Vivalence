// export const rule = {slug: "possessive", type: "string", title: "Possessive", description: "Indicates whether a noun or pronoun shows possession. Possible values: 'yes' (Possessive: Indicates possession), 'no' (Non-Possessive: Does not indicate possession).", enum: ["yes", "no"],};
// export const meta = {slug: "possessive", enums: {yes: { enum: "yes", title: "Possessive", description: "" }, no: { enum: "no", title: "Non-Possessive", description: "" },},};
export const node = {
  slug: "poss",
  name: "Possessive",
  description: "Indicates whether a noun or pronoun shows possession.",
  traits: ["CATEGORICAL"],
  data: {
    CATEGORICAL: [
      {
        slug: "yes",
        name: "Possessive",
        description: "Indicates possession",
      },
      {
        slug: "no",
        name: "Non-Possessive",
        description: "Does not indicate possession",
      },
    ],
  },
};
