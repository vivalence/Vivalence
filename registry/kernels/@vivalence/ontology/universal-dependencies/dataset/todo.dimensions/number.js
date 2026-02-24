// export const rule = {slug: "number", type: "string", title: "Number", description: "The grammatical number of a noun or verb, indicating singular, plural. Possible values: 'sing' (Singular: One person, place, thing, or idea), 'plur' (Plural: More than one person, place, thing, or idea).", enum: ["sing", "plur"],};
// export const meta = {slug: "number", enums: {sing: {slug: "sing", enum: "sing", title: "Singular", description: "One person, place, thing, or idea",}, plur: {enum: "plur", title: "Plural", description: "More than one person, place, thing, or idea",},},};

export const node = {
  slug: "number",
  name: "number",
  description:
    "The grammatical number of a noun or verb, indicating singular or plural.",
  traits: ["CATEGORICAL", "LEARNABLE"],
  data: {
    LEARNABLE: { driver: "BOOLEAN", type: "INDIVIDUAL" },
    CATEGORICAL: [
      {
        slug: "sing",
        name: "Singular",
        description: "One person, place, thing, or idea",
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { driver: "BAYESIAN", type: "RELATIONAL" } },
      },
      {
        slug: "plur",
        name: "Plural",
        description: "More than one person, place, thing, or idea",
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { driver: "BAYESIAN", type: "RELATIONAL" } },
      },
    ],
  },
};
