export const number = {
  $id: "unit.annotation.number",
  type: "string",
  title: "Number",
  slug: "number",
  description:
    "The grammatical number of a noun or verb, indicating singular, plural. Possible values: 'sing' (Singular: One person, place, thing, or idea), 'plur' (Plural: More than one person, place, thing, or idea).",
  enum: ["sing", "plur"],
};
export const meta = {
  enums: {
    sing: {
      slug: "sing",
      enum: "sing",
      title: "Singular",
      description: "One person, place, thing, or idea",
    },
    plur: {
      enum: "plur",
      title: "Plural",
      description: "More than one person, place, thing, or idea",
    },
  },
};
