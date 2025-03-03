export default {
  slug: "verb",
  name: "Verb",
  description: "A verb is a word that expresses an action or a state of being.",
  annotations: [
    { branch: ["pos"], required: true },
    { branch: ["lemma"], required: true },
    { branch: ["verbform"], required: true },
    { branch: ["suffix"], required: true },
    { branch: ["tense"] },
    { branch: ["mood"] },
    { branch: ["person"] },
    { branch: ["number"] },
    { branch: ["gender"] },
    { branch: ["aspect"] },
  ],
  relations: [
    { unique: { branch: "pos" } },
    { unique: { branch: "lemma" } },
    { unique: { branch: "verbform" } },
    { unique: { branch: "tense" } },
    { unique: { branch: "mood" } },
    { unique: { branch: "person" } },
    { unique: { branch: "aspect" } },
    { unique: { branch: "suffix" } },
    { required: { branch: "lemma" } },
    { required: { branch: "suffix" } },
  ],
};

// {
//   some: [
//     { required: { branch: "pos", leaf: "verb" } },
//     { required: { branch: "pos", leaf: "aux" } },
//   ],
// },
// {
//   condition: {
//     if: { required: { branch: "verbform", leaf: "fin" } },
//     then: [
//       { required: { branch: "mood" } },
//       { required: { branch: "tense" } },
//       { required: { branch: "mood" } },
//       { required: { branch: "person" } },
//       { required: { branch: "number" } },
//       { required: { branch: "aspect" } },
//       { unique: { branch: "number" } },
//       { forbidden: { branch: "gender" } },
//     ],
//   },
// },
// {
//   condition: {
//     if: { required: { branch: "verbform", leaf: "inf" } },
//     then: [
//       { forbidden: { branch: "tense" } },
//       { forbidden: { branch: "mood" } },
//       { forbidden: { branch: "person" } },
//       { forbidden: { branch: "number" } },
//       { forbidden: { branch: "aspect" } },
//       { forbidden: { branch: "gender" } },
//     ],
//   },
// },
// {
//   condition: {
//     if: { required: { branch: "verbform", leaf: "part" } },
//     then: [
//       { forbidden: { branch: "gender" } },
//       { forbidden: { branch: "number" } },
//       { forbidden: { branch: "tense" } },
//       { forbidden: { branch: "mood" } },
//       { forbidden: { branch: "person" } },
//       { forbidden: { branch: "aspect" } },
//     ],
//   },
// },
// {
//   condition: {
//     if: { required: { branch: "verbform", leaf: "ger" } },
//     then: [
//       { forbidden: { branch: "tense" } },
//       { forbidden: { branch: "mood" } },
//       { forbidden: { branch: "person" } },
//       { forbidden: { branch: "number" } },
//       { forbidden: { branch: "aspect" } },
//       { forbidden: { branch: "gender" } },
//     ],
//   },
// },
// annotations:
// allOf: [
//   {
//     if: { properties: { verbform: { const: "fin" } }, required: ["verbform"] },
//     then: {
//       required: ["tense", "mood", "person", "number", "aspect"],
//       properties: { gender: { not: {} } },
//     },
//   },
//   {
//     if: { properties: { verbform: { const: "inf" } }, required: ["verbform"] },
//     then: {
//       properties: {
//         tense: { not: {} },
//         mood: { not: {} },
//         person: { not: {} },
//         number: { not: {} },
//         aspect: { not: {} },
//         gender: { not: {} },
//       },
//     },
//   },
//   {
//     if: { properties: { verbform: { const: "part" } }, required: ["verbform"] },
//     then: {
//       properties: {
//         gender: { not: {} },
//         number: { not: {} },
//         tense: { not: {} },
//         mood: { not: {} },
//         person: { not: {} },
//         aspect: { not: {} },
//       },
//     },
//   },
//   {
//     if: { properties: { verbform: { const: "ger" } }, required: ["verbform"] },
//     then: {
//       properties: {
//         tense: { not: {} },
//         mood: { not: {} },
//         person: { not: {} },
//         number: { not: {} },
//         aspect: { not: {} },
//         gender: { not: {} },
//       },
//     },
//   },
// ],
