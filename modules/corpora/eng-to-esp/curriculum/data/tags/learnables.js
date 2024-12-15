export default [
  {
    number: {
      "number:*": { traits: ["LEARNABLE"], data: { LEARNABLE: { type: "BOOLEAN" } } },
      "number:sing": { traits: ["LEARNABLE"], data: { LEARNABLE: { flavor: "RELATIONAL" } } },
      "number:plur": { traits: ["LEARNABLE"], data: { LEARNABLE: { flavor: "RELATIONAL" } } },
    },
  },
  {
    gender: {
      "gender:*": { traits: ["LEARNABLE"], data: { LEARNABLE: { type: "BOOLEAN" } } },
      "gender:fem": { traits: ["LEARNABLE"], data: { LEARNABLE: { flavor: "RELATIONAL" } } },
      "gender:masc": { traits: ["LEARNABLE"], data: { LEARNABLE: { flavor: "RELATIONAL" } } },
    },
  },
  {
    definite: {
      "definite:*": { traits: ["LEARNABLE"], data: { LEARNABLE: { type: "BOOLEAN" } } },
      "definite:def": { traits: ["LEARNABLE"], data: { LEARNABLE: { flavor: "RELATIONAL" } } },
      "definite:ind": { traits: ["LEARNABLE"], data: { LEARNABLE: { flavor: "RELATIONAL" } } },
    },
  },
].reduce((acc, obj) => {
  Object.values(obj)
    .map(Object.entries)
    .flat()
    .map(([slug, tag]) => {
      acc.push({ slug, ...tag });
    });
  return acc;
}, []);
