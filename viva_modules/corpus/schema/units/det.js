export default (schema) => {
  schema.units.det = {
    ...schema.unit,
    title: "Determiner",
    description:
      "Determiners express the reference of a noun phrase in context, modifying nouns to indicate definiteness, specificity, and quantity. In Spanish, they agree in gender and number with the noun they modify. Categories include articles, demonstratives, possessives, and quantifiers.",
    properties: {
      ...schema.unit.properties,
      annotation: {
        type: "object",
        properties: {
          pos: {
            ...schema.annotations.pos,
            $id: "det.annotation.pos",
            enum: ["det"],
          },
          lemma: { ...schema.annotations.lemma },
          prontype: { ...schema.annotations.prontype },
          definite: { ...schema.annotations.definite },
          poss: { ...schema.annotations.poss },
          person: { ...schema.annotations.person },
          number: { ...schema.annotations.number },
          gender: { ...schema.annotations.gender },
        },
        required: ["pos", "lemma", "prontype"],
        allOf: [
          {
            if: { properties: { prontype: { const: "art" } }, required: ["prontype"] },
            then: { required: ["definite"] },
          },
          {
            if: { properties: { prontype: { const: "prs" } }, required: ["prontype"] },
            then: { required: ["poss", "person"] },
          },
        ],
      },
    },
  };

  schema.constraints.det = [
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
  ];

  return schema;
};

// export const schema = {
//   ...unit,
//   title: "Determiner",
//   description:
//     "Determiners express the reference of a noun phrase in context, modifying nouns to indicate definiteness, specificity, and quantity. In Spanish, they agree in gender and number with the noun they modify. Categories include articles, demonstratives, possessives, and quantifiers.",
//   properties: {
//     ...unit.properties,
//     annotation: {
//       type: "object",
//       properties: {
//         pos: {
//           ...annotations.pos,
//           $id: "det.annotation.pos",
//           enum: ["det"],
//         },
//         lemma: { ...annotations.lemma },

//         prontype: { ...annotations.prontype },
//         definite: { ...annotations.definite },
//         poss: { ...annotations.poss },

//         person: { ...annotations.person },
//         number: { ...annotations.number },
//         gender: { ...annotations.gender },
//       },
//       required: ["pos", "lemma", "prontype"],
//       allOf: [
//         {
//           if: { properties: { prontype: { const: "art" } }, required: ["prontype"] },
//           then: { required: ["definite"] },
//         },
//         {
//           if: { properties: { prontype: { const: "prs" } }, required: ["prontype"] },
//           then: { required: ["poss", "person"] },
//         },
//       ],
//     },
//   },
// };

// export const constraints = [
//   { unique: { branch: "pos" } },
//   { unique: { branch: "prontype" } },
//   { required: { branch: "pos", leaf: "det" } },
//   { required: { branch: "prontype" } },
//   // { required: { branch: "gender" } },
//   // { required: { branch: "number" } },
//   {
//     condition: {
//       if: { required: { branch: "prontype", leaf: "art" } },
//       then: [{ required: { branch: "definite" } }],
//     },
//   },
//   {
//     condition: {
//       if: { required: { branch: "prontype", leaf: "prs" } },
//       then: [{ required: { branch: "poss" } }, { required: { branch: "person" } }],
//     },
//   },
// ];

// export const units = [
//   [
//     ["pos", ["det"]],
//     ["prontype", ["art"]],
//     ["definite", ["def", "ind"]],
//     ["number", ["sing"]],
//     ["gender", ["masc"]],
//   ],
//   [
//     ["lemma", ["este", "ese", "aquel"]],
//     ["pos", ["det"]],
//     ["prontype", ["dem"]],
//     ["number", ["sing"]],
//     ["gender", ["masc"]],
//   ],
//   [
//     ["number", ["sing", "plur"]],
//     ["person", ["1", "2", "3"]],
//     ["pos", ["det"]],
//     ["prontype", ["prs"]],
//     ["poss", ["yes"]],
//     // ["lemma", ["mi", "tu", "su", "nuestro", "vuestro"]],
//   ],
//   // [["lemma", ["todo"]], ["pos", ["det"]], ["prontype", ["tot"]], ["number", ["sing"]], ["gender", ["masc"]]],
//   // [["lemma", ["mucho", "poco", "algún", "cada", "otro", "cualquier", "demasiado", "vario", "alguno"]], ["pos", ["det"]], ["prontype", ["ind"]], ["number", ["sing"]], ["gender", ["masc"]]]
//   // [["lemma", ["ninguno"]], ["pos", ["det"]], ["prontype", ["neg"]], ["number", ["sing"]], ["gender", ["masc"]]]
// ];

// export const lemmas = [];
// for (const [branch, leaves] of annotationSpace.flat()) {
//   if (branch !== "lemma") continue;
//   lemmas.push(...leaves);
// }
