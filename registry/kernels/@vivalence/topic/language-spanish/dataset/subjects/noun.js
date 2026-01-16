export default {
  slug: "noun",
  name: "Noun",
  description: "A noun is a word that represents a person, place, or thing.",
  // // NEW
  // annotation: [
  //   { branch: ["pos", "noun"], required: true },
  //   { branch: ["lemma", "*"], required: true },
  //   { branch: ["gender", ["masc", "fem"]], required: true },
  //   { branch: ["number", "*"], required: true },
  // ],
  // export default {slug: "verb", annotation: {all: [{ required: ["pos", "verb"] }, { required: ["lemma"] }, { required: ["verbform", ["fin", "inf", "part", "ger"]] }, { required: ["suffix"] }, // Optional dimensions (define schema properties) { optional: ["tense"] }, { optional: ["mood"] }, { optional: ["person"] }, { optional: ["number"] }, { optional: ["gender"] }, { optional: ["aspect"] }, // Conditional: finite verbs {if: { match: ["verbform", "fin"] }, then: {all: [{ required: ["tense"] }, { required: ["mood"] }, { required: ["person"] }, { required: ["number"] }, { required: ["aspect"] }, { forbidden: ["gender"] },],},}, // Conditional: non-finite verbs {if: {some: [{ match: ["verbform", "inf"] }, { match: ["verbform", "ger"] }, { match: ["verbform", "part"] },],}, then: {all: [{ forbidden: ["tense"] }, { forbidden: ["mood"] }, { forbidden: ["person"] }, { forbidden: ["number"] }, { forbidden: ["aspect"] }, { forbidden: ["gender"] },],},},],},};
  dimensions: [
    { branch: ["pos"], required: true },
    { branch: ["lemma"], required: true },
    { branch: ["gender"], required: true },
    { branch: ["number"], required: true },
  ],
  relations: [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "noun" } },
    { unique: { branch: "gender" } },
    {
      some: [
        { required: { branch: "gender", leaf: "masc" } },
        { required: { branch: "gender", leaf: "fem" } },
      ],
    },
    { required: { branch: "number" } },
  ],
};
