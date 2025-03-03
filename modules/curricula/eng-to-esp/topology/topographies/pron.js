export default {
  slug: "pron",
  name: "Pronoun",
  description:
    "A pronoun substitutes for a noun or noun phrase, referring to entities without naming them. Spanish pronouns include personal, reflexive, demonstrative, relative, interrogative, indefinite, and possessive types. They agree in gender, number, and sometimes case with the nouns they replace.",

  annotations: [
    { branch: ["pos"], required: true },
    { branch: ["lemma"], required: true },
    { branch: ["prontype"], required: true },
    { branch: ["number"] },
    { branch: ["gender"] },
    { branch: ["prepcase"] },
    { branch: ["reflex"] },
  ],

  relations: [
    { unique: { branch: "pos" } },
    { unique: { branch: "prontype" } },
    { unique: { branch: "prepcase" } },
    { unique: { branch: "reflex" } },
    { unique: { branch: "person" } },
    { unique: { branch: "number" } },
    { required: { branch: "pos", leaf: "pron" } },
    { required: { branch: "prontype" } },
  ],
};

// annotation: {
// allOf: [
//   {
//     if: { properties: { prontype: { const: "prs" } }, required: ["prontype"] },
//     then: {
//       required: ["person", "number"],
//     },
//   },
// ],

// {
//   condition: {
//     if: { required: { branch: "prontype", leaf: "prs" } },
//     then: [
//       { required: { branch: "person" } },
//       { required: { branch: "number" } },
//       { unique: { branch: "reflex" } },
//       { unique: { branch: "prepcase" } },
//     ],
//   },
// },
