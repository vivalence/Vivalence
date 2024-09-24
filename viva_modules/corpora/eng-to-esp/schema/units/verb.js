export default (schema) => {
  schema.units.verb = {
    ...schema.unit,
    title: "Verb",
    description: "A verb is a word that expresses an action or a state of being.",
    properties: {
      ...schema.unit.properties,
      annotation: {
        ...schema.unit.properties.annotation,
        properties: {
          pos: { ...schema.annotations.pos, $id: "verb.annotation.pos", enum: ["verb"] },
          lemma: { ...schema.annotations.lemma },
          verbform: { ...schema.annotations.verbform },
          tense: { ...schema.annotations.tense },
          mood: { ...schema.annotations.mood },
          person: { ...schema.annotations.person },
          gender: { ...schema.annotations.gender },
          number: { ...schema.annotations.number },
          aspect: { ...schema.annotations.aspect },
        },
        required: ["pos", "lemma", "verbform"],
        allOf: [
          {
            if: { properties: { verbform: { const: "fin" } }, required: ["verbform"] },
            then: {
              required: ["tense", "mood", "person", "number", "aspect"],
              properties: { gender: { not: {} } },
            },
          },
          {
            if: { properties: { verbform: { const: "inf" } }, required: ["verbform"] },
            then: {
              properties: {
                tense: { not: {} },
                mood: { not: {} },
                person: { not: {} },
                number: { not: {} },
                aspect: { not: {} },
                gender: { not: {} },
              },
            },
          },
          {
            if: { properties: { verbform: { const: "part" } }, required: ["verbform"] },
            then: {
              properties: {
                gender: { not: {} },
                number: { not: {} },
                tense: { not: {} },
                mood: { not: {} },
                person: { not: {} },
                aspect: { not: {} },
              },
            },
          },
          {
            if: { properties: { verbform: { const: "ger" } }, required: ["verbform"] },
            then: {
              properties: {
                tense: { not: {} },
                mood: { not: {} },
                person: { not: {} },
                number: { not: {} },
                aspect: { not: {} },
                gender: { not: {} },
              },
            },
          },
        ],
      },
    },
  };

  schema.constraints.verb = [
    { unique: { branch: "pos" } },
    { unique: { branch: "lemma" } },
    { unique: { branch: "verbform" } },
    { unique: { branch: "tense" } },
    { unique: { branch: "mood" } },
    { unique: { branch: "person" } },
    { unique: { branch: "aspect" } },
    {
      some: [
        { required: { branch: "pos", leaf: "verb" } },
        { required: { branch: "pos", leaf: "aux" } },
      ],
    },
    {
      condition: {
        if: { required: { branch: "verbform", leaf: "fin" } },
        then: [
          { required: { branch: "mood" } },
          { required: { branch: "tense" } },
          { required: { branch: "mood" } },
          { required: { branch: "person" } },
          { required: { branch: "number" } },
          { required: { branch: "aspect" } },
          { unique: { branch: "number" } },
          { forbidden: { branch: "gender" } },
        ],
      },
    },
    {
      condition: {
        if: { required: { branch: "verbform", leaf: "inf" } },
        then: [
          { forbidden: { branch: "tense" } },
          { forbidden: { branch: "mood" } },
          { forbidden: { branch: "person" } },
          { forbidden: { branch: "number" } },
          { forbidden: { branch: "aspect" } },
          { forbidden: { branch: "gender" } },
        ],
      },
    },
    {
      condition: {
        if: { required: { branch: "verbform", leaf: "part" } },
        then: [
          { forbidden: { branch: "gender" } },
          { forbidden: { branch: "number" } },
          { forbidden: { branch: "tense" } },
          { forbidden: { branch: "mood" } },
          { forbidden: { branch: "person" } },
          { forbidden: { branch: "aspect" } },
        ],
      },
    },
    {
      condition: {
        if: { required: { branch: "verbform", leaf: "ger" } },
        then: [
          { forbidden: { branch: "tense" } },
          { forbidden: { branch: "mood" } },
          { forbidden: { branch: "person" } },
          { forbidden: { branch: "number" } },
          { forbidden: { branch: "aspect" } },
          { forbidden: { branch: "gender" } },
        ],
      },
    },
  ];

  schema.units.aux = {
    ...schema.units.verb,
    properties: {
      ...schema.units.verb.properties,
      annotation: {
        ...schema.units.verb.properties.annotation,
        properties: {
          ...schema.units.verb.properties.annotation.properties,
          pos: {
            ...schema.annotations.pos,
            $id: "aux.annotation.pos",
            enum: ["aux"],
          },
        },
      },
    },
  };

  schema.constraints.aux = [...schema.constraints.verb];

  return schema;
};

// import annotations from "../annotations";
// import unit from "../unit";

// export const schema = {
//   ...unit,
//   properties: {
//     ...unit.properties,
//     english: {
//       type: "string",
//       description:
//         "the english translation. if conjugated, then including the corresponding pronoun - e.g. 'I eat', 'he/she/it ate', 'you (all) will eat'. if verb is ambiguous, then includes clarifying reference - e.g. to have (possession) vs to have (auxiliary).",
//     },
//     annotation: {
//       type: "object",
//       // comspute properties from scope.
//       // compute scope from conditional.
//       // scope: [["pos", ["verb"]], "lemma", "verbform", "tense", "mood", "person", "gender", "number", "aspect"],

//       properties: {
//         pos: { ...annotations.pos, $id: "verb.annotation.pos", enum: ["verb"] },
//         lemma: { ...annotations.lemma },
//         verbform: { ...annotations.verbform },
//         tense: { ...annotations.tense },
//         mood: { ...annotations.mood },
//         person: { ...annotations.person },
//         gender: { ...annotations.gender },
//         number: { ...annotations.number },
//         aspect: { ...annotations.aspect },
//       },

//       required: ["pos", "lemma", "verbform"],
//       allOf: [
//         {
//           if: { properties: { verbform: { const: "fin" } }, required: ["verbform"] },
//           then: {
//             required: ["tense", "mood", "person", "number", "aspect"],
//             properties: { gender: { not: {} } },
//           },
//         },
//         {
//           if: { properties: { verbform: { const: "inf" } }, required: ["verbform"] },
//           then: {
//             properties: {
//               tense: { not: {} },
//               mood: { not: {} },
//               person: { not: {} },
//               number: { not: {} },
//               aspect: { not: {} },
//               gender: { not: {} },
//             },
//           },
//         },
//         {
//           if: { properties: { verbform: { const: "part" } }, required: ["verbform"] },
//           then: {
//             properties: {
//               gender: { not: {} },
//               number: { not: {} },
//               tense: { not: {} },
//               mood: { not: {} },
//               person: { not: {} },
//               aspect: { not: {} },
//             },
//           },
//         },
//         {
//           if: { properties: { verbform: { const: "ger" } }, required: ["verbform"] },
//           then: {
//             properties: {
//               tense: { not: {} },
//               mood: { not: {} },
//               person: { not: {} },
//               number: { not: {} },
//               aspect: { not: {} },
//               gender: { not: {} },
//             },
//           },
//         },
//       ],
//     },
//   },
// };

// export const constraints = [
//   { unique: { branch: "pos" } },
//   { unique: { branch: "lemma" } },
//   { unique: { branch: "verbform" } },
//   { unique: { branch: "tense" } },
//   { unique: { branch: "mood" } },
//   { unique: { branch: "person" } },
//   { unique: { branch: "aspect" } },
//   {
//     some: [
//       { required: { branch: "pos", leaf: "verb" } },
//       { required: { branch: "pos", leaf: "aux" } },
//     ],
//   },
//   {
//     condition: {
//       if: { required: { branch: "verbform", leaf: "fin" } },
//       then: [
//         { required: { branch: "mood" } },
//         { required: { branch: "tense" } },
//         { required: { branch: "mood" } },
//         { required: { branch: "person" } },
//         { required: { branch: "number" } },
//         { required: { branch: "aspect" } },
//         { unique: { branch: "number" } },
//         { forbidden: { branch: "gender" } },
//       ],
//     },
//   },
//   {
//     condition: {
//       if: { required: { branch: "verbform", leaf: "inf" } },
//       then: [
//         { forbidden: { branch: "tense" } },
//         { forbidden: { branch: "mood" } },
//         { forbidden: { branch: "person" } },
//         { forbidden: { branch: "number" } },
//         { forbidden: { branch: "aspect" } },
//         { forbidden: { branch: "gender" } },
//       ],
//     },
//   },
//   {
//     condition: {
//       if: { required: { branch: "verbform", leaf: "part" } },
//       then: [
//         { forbidden: { branch: "gender" } },
//         { forbidden: { branch: "number" } },
//         { forbidden: { branch: "tense" } },
//         { forbidden: { branch: "mood" } },
//         { forbidden: { branch: "person" } },
//         { forbidden: { branch: "aspect" } },
//       ],
//     },
//   },
//   {
//     condition: {
//       if: { required: { branch: "verbform", leaf: "ger" } },
//       then: [
//         { forbidden: { branch: "tense" } },
//         { forbidden: { branch: "mood" } },
//         { forbidden: { branch: "person" } },
//         { forbidden: { branch: "number" } },
//         { forbidden: { branch: "aspect" } },
//         { forbidden: { branch: "gender" } },
//       ],
//     },
//   },
// ];

// // export const lemmas = [
// // lemmas is unit specific, so it should be exported from the unit file.
// const lemmas = [
//   "ser",
//   "estar",
//   "tener",
//   "hacer",
//   "poder",
//   "decir",
//   "ir",
//   "ver",
//   "dar",
//   "saber",
//   "querer",
//   "llegar",
//   "pasar",
//   "deber",
//   "poner",
//   "parecer",
//   "quedar",
//   "creer",
//   "hablar",
//   "llevar",
// ];
// export const corpusAutocomplete = [
//   [
//     ["lemma", lemmas],
//     ["pos", ["verb"]],
//     ["verbform", ["fin"]],
//     ["mood", ["ind"]],
//     ["tense", ["pres", "past", "fut", "imp"]],
//     ["number", ["sing", "plur"]],
//     ["person", ["1", "2", "3"]],
//   ],
//   [
//     ["lemma", lemmas],
//     ["pos", ["verb"]],
//     ["verbform", ["inf", "ger", "part"]],
//   ],
// ];
