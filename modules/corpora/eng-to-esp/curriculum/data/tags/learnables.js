// TODO:
// aspect degree number numform numtype polarity poss prepcase
// prontype reflex suffix verbform
// vivalence/modules/ontologies/language/schema/annotations

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
  {
    person: {
      "person:*": { traits: ["LEARNABLE"], data: { LEARNABLE: { type: "BOOLEAN" } } },
      "person:1": { traits: ["LEARNABLE"], data: { LEARNABLE: { flavor: "RELATIONAL" } } },
      "person:2": { traits: ["LEARNABLE"], data: { LEARNABLE: { flavor: "RELATIONAL" } } },
      "person:3": { traits: ["LEARNABLE"], data: { LEARNABLE: { flavor: "RELATIONAL" } } },
    },
  },
  {
    mood: {
      "mood:*": { traits: ["LEARNABLE"], data: { LEARNABLE: { type: "BOOLEAN" } } },
      "mood:ind": { traits: ["LEARNABLE"], data: { LEARNABLE: { flavor: "RELATIONAL" } } },
      "mood:sub": { traits: ["LEARNABLE"], data: { LEARNABLE: { flavor: "RELATIONAL" } } },
      "mood:imp": { traits: ["LEARNABLE"], data: { LEARNABLE: { flavor: "RELATIONAL" } } },
      "mood:cnd": { traits: ["LEARNABLE"], data: { LEARNABLE: { flavor: "RELATIONAL" } } },
    },
  },
  {
    tense: {
      "tense:*": { traits: ["LEARNABLE"], data: { LEARNABLE: { type: "BOOLEAN" } } },
      "tense:past": { traits: ["LEARNABLE"], data: { LEARNABLE: { flavor: "RELATIONAL" } } },
      "tense:pres": { traits: ["LEARNABLE"], data: { LEARNABLE: { flavor: "RELATIONAL" } } },
      "tense:fut": { traits: ["LEARNABLE"], data: { LEARNABLE: { flavor: "RELATIONAL" } } },
      "tense:imp": { traits: ["LEARNABLE"], data: { LEARNABLE: { flavor: "RELATIONAL" } } },
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
