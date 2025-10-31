export default [
  {
    pos: {
      "pos:num": { traits: ["COMPLETABLE"] },
      "pos:adj": { traits: ["COMPLETABLE"] },
      "pos:noun": { traits: ["COMPLETABLE"] },
      "pos:verb": { traits: ["COMPLETABLE"] },
      "pos:adv": { traits: ["COMPLETABLE"] },
      "pos:aux": { traits: ["COMPLETABLE"] },
      "pos:cconj": { traits: ["COMPLETABLE"] },
      "pos:det": { traits: ["COMPLETABLE"] },
      "pos:intj": { traits: ["COMPLETABLE"] },
      "pos:part": { traits: ["COMPLETABLE"] },
      "pos:pron": { traits: ["COMPLETABLE"] },
      "pos:propn": { traits: ["COMPLETABLE"] },
      "pos:punct": { traits: ["COMPLETABLE"] },
      "pos:sconj": { traits: ["COMPLETABLE"] },
    },
    // @lj temp moved to learnables
    // until i figure out completeable pick and review mechanics.

    // lemma: {
    //   // TODO: //   // "lemma:beber": { traits: ["COMPLETABLE"] }, //   // "lemma:viajar": { traits: ["COMPLETABLE"] }, //   // "lemma:aprender": { traits: ["COMPLETABLE"] },
    //   "lemma:hablar": { traits: ["COMPLETABLE"] },
    //   "lemma:comer": { traits: ["COMPLETABLE"] },
    //   "lemma:correr": { traits: ["COMPLETABLE"] },
    //   "lemma:leer": { traits: ["COMPLETABLE"] },
    //   "lemma:escribir": { traits: ["COMPLETABLE"] },
    //   "lemma:trabajar": { traits: ["COMPLETABLE"] },
    //   "lemma:estudiar": { traits: ["COMPLETABLE"] },
    //   "lemma:escuchar": { traits: ["COMPLETABLE"] },
    //   "lemma:ver": { traits: ["COMPLETABLE"] },
    //   "lemma:estar": { traits: ["COMPLETABLE"] },
    //   "lemma:ser": { traits: ["COMPLETABLE"] },
    //   "lemma:ir": { traits: ["COMPLETABLE"] },
    //   "lemma:venir": { traits: ["COMPLETABLE"] },
    //   "lemma:querer": { traits: ["COMPLETABLE"] },
    //   "lemma:poder": { traits: ["COMPLETABLE"] },
    //   "lemma:poner": { traits: ["COMPLETABLE"] },
    // },
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
