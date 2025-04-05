// TODO:
// aspect degree number numform numtype polarity poss prepcase
// prontype reflex suffix verbform
// vivalence/modules/ontologies/language/schema/annotations

export default [
  {
    // temporary hack
    // lemma: {
    //   // TODO: "lemma:beber": { traits: ["COMPLETABLE"] }, "lemma:viajar": { traits: ["COMPLETABLE"] }, "lemma:aprender": { traits: ["COMPLETABLE"] },
    //   "lemma:hablar": { traits: ["LEARNABLE"], data: { LEARNABLE: { flavor: "RELATIONAL" } } },
    //   "lemma:vivir": { traits: ["LEARNABLE"], data: { LEARNABLE: { flavor: "RELATIONAL" } } },
    //   "lemma:comer": { traits: ["LEARNABLE"], data: { LEARNABLE: { flavor: "RELATIONAL" } } },
    //   "lemma:estar": { traits: ["LEARNABLE"], data: { LEARNABLE: { flavor: "RELATIONAL" } } },
    //   "lemma:ser": { traits: ["LEARNABLE"], data: { LEARNABLE: { flavor: "RELATIONAL" } } },
    //   "lemma:correr": { traits: ["LEARNABLE"], data: { LEARNABLE: { flavor: "RELATIONAL" } } },
    //   "lemma:leer": { traits: ["LEARNABLE"], data: { LEARNABLE: { flavor: "RELATIONAL" } } },
    //   "lemma:escribir": { traits: ["LEARNABLE"], data: { LEARNABLE: { flavor: "RELATIONAL" } } },
    //   "lemma:trabajar": { traits: ["LEARNABLE"], data: { LEARNABLE: { flavor: "RELATIONAL" } } },
    //   "lemma:estudiar": { traits: ["LEARNABLE"], data: { LEARNABLE: { flavor: "RELATIONAL" } } },
    //   "lemma:escuchar": { traits: ["LEARNABLE"], data: { LEARNABLE: { flavor: "RELATIONAL" } } },
    //   "lemma:ver": { traits: ["LEARNABLE"], data: { LEARNABLE: { flavor: "RELATIONAL" } } },
    //   "lemma:ir": { traits: ["LEARNABLE"], data: { LEARNABLE: { flavor: "RELATIONAL" } } },
    //   "lemma:venir": { traits: ["LEARNABLE"], data: { LEARNABLE: { flavor: "RELATIONAL" } } },
    //   "lemma:querer": { traits: ["LEARNABLE"], data: { LEARNABLE: { flavor: "RELATIONAL" } } },
    //   "lemma:poder": { traits: ["LEARNABLE"], data: { LEARNABLE: { flavor: "RELATIONAL" } } },
    //   "lemma:poner": { traits: ["LEARNABLE"], data: { LEARNABLE: { flavor: "RELATIONAL" } } },
    // },
    number: {
      "number:*": { traits: ["LEARNABLE"], data: { LEARNABLE: { type: "BOOLEAN" } } },
      "number:sing": { traits: ["LEARNABLE"], data: { LEARNABLE: { flavor: "RELATIONAL" } } },
      "number:plur": { traits: ["LEARNABLE"], data: { LEARNABLE: { flavor: "RELATIONAL" } } },
    },
  },
  {
    gender: {
      "gender:*": { traits: ["LEARNABLE"], data: { LEARNABLE: { type: "BOOLEAN" } } },
      "gender:fem": {
        traits: ["LEARNABLE"],
        data: {
          LEARNABLE: {
            flavor: "RELATIONAL",
          },
        },
      },
      "gender:masc": { traits: ["LEARNABLE"], data: { LEARNABLE: { flavor: "RELATIONAL" } } },
    },
  },
  {
    aspect: {
      "aspect:*": { traits: ["LEARNABLE"], data: { LEARNABLE: { type: "BOOLEAN" } } },
      "aspect:imp": { traits: ["LEARNABLE"], data: { LEARNABLE: { flavor: "RELATIONAL" } } },
      "aspect:perf": { traits: ["LEARNABLE"], data: { LEARNABLE: { flavor: "RELATIONAL" } } },
      "aspect:prog": { traits: ["LEARNABLE"], data: { LEARNABLE: { flavor: "RELATIONAL" } } },
      "aspect:prosp": { traits: ["LEARNABLE"], data: { LEARNABLE: { flavor: "RELATIONAL" } } },
      "aspect:iter": { traits: ["LEARNABLE"], data: { LEARNABLE: { flavor: "RELATIONAL" } } },
      "aspect:hab": { traits: ["LEARNABLE"], data: { LEARNABLE: { flavor: "RELATIONAL" } } },
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
