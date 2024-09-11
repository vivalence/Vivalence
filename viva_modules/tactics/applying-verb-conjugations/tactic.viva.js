import provision from "./provision.js";

const tactic = {
  relations: {
    units: {},
    tags: {
      mood: { slug: "mood:ind" },
      tense: { slug: "tense:pres" },
      verbs: [
        { slug: "lemma:creer" },
        { slug: "lemma:dar" },
        { slug: "lemma:deber" },
        { slug: "lemma:decir" },
        { slug: "lemma:estar" },
        { slug: "lemma:hablar" },
        { slug: "lemma:hacer" },
        { slug: "lemma:ir" },
        { slug: "lemma:llegar" },
        { slug: "lemma:llevar" },
        { slug: "lemma:parecer" },
        { slug: "lemma:pasar" },
        { slug: "lemma:poder" },
        { slug: "lemma:poner" },
        { slug: "lemma:quedar" },
        { slug: "lemma:querer" },
        { slug: "lemma:saber" },
        { slug: "lemma:ser" },
        { slug: "lemma:tener" },
        { slug: "lemma:ver" },
      ],
    },
    games: {
      translations: { slug: "translations" },
      flashcards: { slug: "flashcards" },
      conjugations: { slug: "conjugations" },
    },
  },
  masks: {},
};

export default {
  manifest: {
    type: "Tactic",
    name: "Verb Conjugation",
    slug: "applying-verb-conjugations",
    description:
      "Conjugate a set of verbs for a given tense and mood. Supported by flashcards and a translation.",
    modules: {
      domain: "file://../../domain/domain.viva.js",
      ontology: "file://../../ontology/ontology.viva.js",
    },
  },
  tactic,
  provision,
};
