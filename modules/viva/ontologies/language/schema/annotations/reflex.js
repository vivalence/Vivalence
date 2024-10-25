export const reflex = {
  $id: "unit.annotation.reflex",
  type: "string",
  title: "Reflexive",
  description:
    "Indicates whether a verb is reflexive. Possible values: 'yes' (Reflexive: Indicates the subject performs the action on itself), 'no' (Non-Reflexive: The action is not performed on the subject itself).",
  enum: ["yes", "no"],
};
export const meta = {
  slug: "reflexive",
  enums: {
    yes: { enum: "yes", title: "Reflexive", description: "" },
    no: { enum: "no", title: "Non-Reflexive", description: "" },
  },
};
