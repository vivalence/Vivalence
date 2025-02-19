export const rule = {
  slug: "reflex",
  type: "string",
  title: "Reflexive",
  description:
    "Indicates whether a verb is reflexive. Possible values: 'yes' (Reflexive: Indicates the subject performs the action on itself), 'no' (Non-Reflexive: The action is not performed on the subject itself).",
  enum: ["yes", "no"],
};
// export const meta = {slug: "reflexive", enums: {yes: { enum: "yes", title: "Reflexive", description: "" }, no: { enum: "no", title: "Non-Reflexive", description: "" },},};

export const node = {
  slug: "reflexive",
  name: "reflexive",
  description: "Indicates whether a verb is reflexive.",
  traits: ["ANCESTOR", "CATEGORICAL"],
  data: {
    ANCESTOR: [
      {
        slug: "yes",
        name: "Reflexive",
        description: "Indicates the subject performs the action on itself",
      },
      {
        slug: "no",
        name: "Non-Reflexive",
        description: "The action is not performed on the subject itself",
      },
    ],
  },
};
