// TODO:
// aspect degree number numform numtype polarity poss prepcase
// prontype reflex suffix verbform
// vivalence/modules/ontologies/language/schema/annotations

export default [
  {
    // temporary hack
    // lemma: {
    //   // TODO: "lemma:beber": { traits: ["COMPLETABLE"] }, "lemma:viajar": { traits: ["COMPLETABLE"] }, "lemma:aprender": { traits: ["COMPLETABLE"] },
    //   "lemma:hablar": { traits: ["LEARNABLE"], data: { LEARNABLE: { type: "RELATIONAL" } } },
    //   "lemma:vivir": { traits: ["LEARNABLE"], data: { LEARNABLE: { type: "RELATIONAL" } } },
    //   "lemma:comer": { traits: ["LEARNABLE"], data: { LEARNABLE: { type: "RELATIONAL" } } },
    //   "lemma:estar": { traits: ["LEARNABLE"], data: { LEARNABLE: { type: "RELATIONAL" } } },
    //   "lemma:ser": { traits: ["LEARNABLE"], data: { LEARNABLE: { type: "RELATIONAL" } } },
    //   "lemma:correr": { traits: ["LEARNABLE"], data: { LEARNABLE: { type: "RELATIONAL" } } },
    //   "lemma:leer": { traits: ["LEARNABLE"], data: { LEARNABLE: { type: "RELATIONAL" } } },
    //   "lemma:escribir": { traits: ["LEARNABLE"], data: { LEARNABLE: { type: "RELATIONAL" } } },
    //   "lemma:trabajar": { traits: ["LEARNABLE"], data: { LEARNABLE: { type: "RELATIONAL" } } },
    //   "lemma:estudiar": { traits: ["LEARNABLE"], data: { LEARNABLE: { type: "RELATIONAL" } } },
    //   "lemma:escuchar": { traits: ["LEARNABLE"], data: { LEARNABLE: { type: "RELATIONAL" } } },
    //   "lemma:ver": { traits: ["LEARNABLE"], data: { LEARNABLE: { type: "RELATIONAL" } } },
    //   "lemma:ir": { traits: ["LEARNABLE"], data: { LEARNABLE: { type: "RELATIONAL" } } },
    //   "lemma:venir": { traits: ["LEARNABLE"], data: { LEARNABLE: { type: "RELATIONAL" } } },
    //   "lemma:querer": { traits: ["LEARNABLE"], data: { LEARNABLE: { type: "RELATIONAL" } } },
    //   "lemma:poder": { traits: ["LEARNABLE"], data: { LEARNABLE: { type: "RELATIONAL" } } },
    //   "lemma:poner": { traits: ["LEARNABLE"], data: { LEARNABLE: { type: "RELATIONAL" } } },
    // },
    number: {
      "number:*": {
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { driver: "BOOLEAN" } },
      },
      "number:sing": {
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { type: "RELATIONAL" } },
      },
      "number:plur": {
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { type: "RELATIONAL" } },
      },
    },
  },
  {
    gender: {
      "gender:*": {
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { driver: "BOOLEAN" } },
      },
      "gender:fem": {
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { type: "RELATIONAL" } },
      },
      "gender:masc": {
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { type: "RELATIONAL" } },
      },
    },
  },
  {
    aspect: {
      "aspect:*": {
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { driver: "BOOLEAN" } },
      },
      "aspect:imp": {
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { type: "RELATIONAL" } },
      },
      "aspect:perf": {
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { type: "RELATIONAL" } },
      },
      "aspect:prog": {
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { type: "RELATIONAL" } },
      },
      "aspect:prosp": {
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { type: "RELATIONAL" } },
      },
      "aspect:iter": {
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { type: "RELATIONAL" } },
      },
      "aspect:hab": {
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { type: "RELATIONAL" } },
      },
    },
  },
  {
    definite: {
      "definite:*": {
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { driver: "BOOLEAN" } },
      },
      "definite:def": {
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { type: "RELATIONAL" } },
      },
      "definite:ind": {
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { type: "RELATIONAL" } },
      },
    },
  },
  {
    person: {
      "person:*": {
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { driver: "BOOLEAN" } },
      },
      "person:1": {
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { type: "RELATIONAL" } },
      },
      "person:2": {
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { type: "RELATIONAL" } },
      },
      "person:3": {
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { type: "RELATIONAL" } },
      },
    },
  },
  {
    mood: {
      "mood:*": {
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { driver: "BOOLEAN" } },
      },
      "mood:ind": {
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { type: "RELATIONAL" } },
      },
      "mood:sub": {
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { type: "RELATIONAL" } },
      },
      "mood:imp": {
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { type: "RELATIONAL" } },
      },
      "mood:cnd": {
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { type: "RELATIONAL" } },
      },
    },
  },
  {
    tense: {
      "tense:*": {
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { driver: "BOOLEAN" } },
      },
      "tense:past": {
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { type: "RELATIONAL" } },
      },
      "tense:pres": {
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { type: "RELATIONAL" } },
      },
      "tense:fut": {
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { type: "RELATIONAL" } },
      },
      "tense:imp": {
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { type: "RELATIONAL" } },
      },
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
