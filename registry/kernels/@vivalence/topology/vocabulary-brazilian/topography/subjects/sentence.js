export default {
  slug: "sentence",
  name: "Sentence",
  description: "Sentences are sentences",
  dimensions: [
    { branch: ["pos", "sentence"], required: true },
    { branch: ["text"], required: true },
  ],
  relations: [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "sentence" } },
    { required: { branch: "text" } },
  ],
};

// dimensions
// const force        = { slug: "force",        values: ["decl","inter","imp","excl","opt"] }
// const finiteness   = { slug: "finiteness",   values: ["fin","inf","part","ger"] }
// const mood         = { slug: "mood",         values: ["ind","sub","cnd","imp","jus"] }
// const tense        = { slug: "tense",        values: ["pres","past","fut","imp","pqp"] }
// const aspect       = { slug: "aspect",       values: ["perf","imp","prog"] }
// const polarity     = { slug: "polarity",     values: ["pos","neg"] }
// const voice        = { slug: "voice",        values: ["act","pass","mid"] }
// const interrogative_type = { slug: "interrogative_type", values: ["polar","content","alternative"] }
// const wh_element   = { slug: "wh_element",   values: ["what","who","where","when","how","why","which"] }
// const evidentiality = { slug: "evidentiality", values: ["direct","reported","inferred"] }
// const politeness   = { slug: "politeness",   values: ["inf","pol","form"] }

// sentences
// const declarative = {
//   slug: "declarative",
//   dimensions: [
//     { branch: ["force"],      required: true },
//     { branch: ["finiteness"], required: true },
//     { branch: ["mood"],       required: true },
//     { branch: ["tense"],      required: true },
//     { branch: ["polarity"],   required: true },
//     { branch: ["aspect"] },
//     { branch: ["voice"] },
//     { branch: ["evidentiality"] },
//   ],
//   relations: [
//     { required: { branch: "force",      leaf: "decl" } },
//     { required: { branch: "finiteness", leaf: "fin"  } },
//     { required: { branch: "mood" } },
//     { required: { branch: "tense" } },
//     { required: { branch: "polarity" } },
//   ],
// }

// const interrogative = {
//   slug: "interrogative",
//   dimensions: [
//     { branch: ["force"],              required: true },
//     { branch: ["finiteness"],         required: true },
//     { branch: ["mood"],               required: true },
//     { branch: ["tense"],              required: true },
//     { branch: ["polarity"],           required: true },
//     { branch: ["interrogative_type"], required: true },
//     { branch: ["wh_element"] },
//     { branch: ["voice"] },
//   ],
//   relations: [
//     { required: { branch: "force", leaf: "inter" } },
//     { required: { branch: "interrogative_type" } },
//     {
//       condition: {
//         if:   { required: { branch: "interrogative_type", leaf: "content" } },
//         then: [{ required: { branch: "wh_element" } }],
//       },
//     },
//   ],
// }

// const imperative = {
//   slug: "imperative",
//   dimensions: [
//     { branch: ["force"],     required: true },
//     { branch: ["polarity"],  required: true },
//     { branch: ["politeness"] },
//     { branch: ["voice"] },
//   ],
//   relations: [
//     { required: { branch: "force",    leaf: "imp" } },
//     { required: { branch: "polarity" } },
//   ],
// }

// const exclamative = {
//   slug: "exclamative",
//   dimensions: [
//     { branch: ["force"],    required: true },
//     { branch: ["polarity"], required: true },
//     { branch: ["mood"] },
//     { branch: ["tense"] },
//   ],
//   relations: [
//     { required: { branch: "force",    leaf: "excl" } },
//     { required: { branch: "polarity" } },
//   ],
// }

// const optative = {
//   slug: "optative",
//   dimensions: [
//     { branch: ["force"],    required: true },
//     { branch: ["polarity"], required: true },
//     { branch: ["mood"],     required: true },
//     { branch: ["tense"] },
//   ],
//   relations: [
//     { required: { branch: "force",    leaf: "opt" } },
//     { required: { branch: "mood",     leaf: "sub" } },
//     { required: { branch: "polarity" } },
//   ],
// }
