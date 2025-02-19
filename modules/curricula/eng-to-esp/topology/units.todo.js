// * TODO migreate this to modules and a reducer.

// import * as pos from "./annotations/pos.js";
// import * as lemma from "./annotations/lemma.js";
// import * as verbform from "./annotations/verbform.js";
// import * as tense from "./annotations/tense.js";
// import * as mood from "./annotations/mood.js";
// import * as person from "./annotations/person.js";
// import * as number from "./annotations/number.js";
// import * as aspect from "./annotations/aspect.js";
// import * as gender from "./annotations/gender.js";
// import * as degree from "./annotations/degree.js";
// import * as poss from "./annotations/poss.js";
// import * as reflex from "./annotations/reflex.js";
// import * as definite from "./annotations/definite.js";
// import * as prontype from "./annotations/prontype.js";
// import * as prepcase from "./annotations/prepcase.js";
// import * as numtype from "./annotations/numtype.js";
// import * as numform from "./annotations/numform.js";
// import * as polarity from "./annotations/polarity.js";

// export default (schema) => {
//   const { annotations, meta } = Object.entries({
//     pos,
//     lemma,
//     verbform,
//     tense,
//     mood,
//     person,
//     number,
//     aspect,
//     gender,
//     degree,
//     poss,
//     reflex,
//     definite,
//     prontype,
//     numtype,
//     numform,
//     polarity,
//   }).reduce((acc, [key, value]) => {
//     acc.annotations[key] = value[key];
//     if (value.meta) acc.meta[key] = value.meta;
//     return acc;
//   }, { annotations: {}, meta: {} });

//   return { ...schema, annotations, meta };
// };

// export const verbform = {
//   $id: "unit.annotation.verbform",
//   type: "string",
//   title: "Verb Form",
//   description:
//     "The form of a verb, indicating its function in a sentence. Possible values: 'fin' (Finite: A verb form that is limited by subject and tense), 'inf' (Infinitive: The base form of a verb, usually preceded by 'to'), 'part' (Participle: A form of a verb used as an adjective or to form compound tenses), 'ger' (Gerund: A verb form that functions as a noun), 'sup' (Supine: A form of a verb used in some languages to denote purpose or intention).",
//   enum: ["fin", "inf", "part", "ger"],
// };
// export const meta = {
//   slug: "verbform",
//   enums: {
//     fin: {
//       enum: "fin",
//       title: "Finite",
//       description: "A verb form that is limited by subject and tense.",
//     },
//     inf: {
//       enum: "inf",
//       title: "Infinitive",
//       description: "The base form of a verb, usually preceded by 'to'.",
//     },
//     part: {
//       enum: "part",
//       title: "Participle",
//       description: "A form of a verb used as an adjective or to form compound tenses.",
//     },
//     ger: {
//       enum: "ger",
//       title: "Gerund",
//       description: "A verb form that functions as a noun.",
//     },
//   },
// };
