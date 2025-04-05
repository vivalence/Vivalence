export default {
  slug: "det",
  name: "Determiner",
  description:
    "Determiners express the reference of a noun phrase in context, modifying nouns to indicate definiteness, specificity, and quantity. In Spanish, they agree in gender and number with the noun they modify. Categories include articles, demonstratives, possessives, and quantifiers.",
  annotations: [
    { branch: ["pos"], required: true },
    { branch: ["lemma"], required: true },
    { branch: ["prontype"], required: true },
    { branch: ["definite"] },
    { branch: ["poss"] },
    { branch: ["person"] },
    { branch: ["number"] },
    { branch: ["gender"] },
    {
      condition: {
        if: { properties: { prontype: { const: "art" } }, required: ["prontype"] },
        then: { required: ["definite"] },
      },
    },
    {
      condition: {
        if: { properties: { prontype: { const: "prs" } }, required: ["prontype"] },
        then: { required: ["poss", "person"] },
      },
    },
  ],
  relations: [
    { unique: { branch: "pos" } },
    { unique: { branch: "prontype" } },
    { required: { branch: "pos", leaf: "det" } },
    { required: { branch: "prontype" } },

    {
      condition: {
        if: { required: { branch: "prontype", leaf: "art" } },
        then: [{ required: { branch: "definite" } }],
      },
    },
    {
      condition: {
        if: { required: { branch: "prontype", leaf: "prs" } },
        then: [{ required: { branch: "poss" } }, { required: { branch: "person" } }],
      },
    },
  ],
};
