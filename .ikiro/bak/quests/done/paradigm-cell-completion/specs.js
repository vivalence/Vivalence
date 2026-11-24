// Hand-composed thirdSingular specs for 39 new word literals + 1 modify.
// Per corpus-quality-criteria.md Paradigm Shape (4-cell rule, no syncretic collapse).
// 2026-05-03 — paradigm-cell-completion quest.
//
// In syncretic tenses (imperfect, conditional, pres.subjunctive) the 3sg surface
// form is homonymous with 1sg. Pronoun framing in `knownEN` + `examplePT/EN`
// drills the você/ele/ela contrast even when the answer string matches 1sg.
//
// querer.conditional uses colloquial `queria` (per Finn 2026-05-03), homonym
// with imperfect-indicative `queria`. 1sg is also modified.

export const NEW_3SG = [
  // ── imperfect.indicative ────────────────────────────────────────────
  {
    lemma: "falar", mood: "indicative", tense: "imperfect",
    form: "falava",
    knownEN: "he/she used to speak",
    exampleEN: "She used to speak with the neighbor every morning",
    examplePT: "Ela falava com a vizinha toda manhã",
  },
  {
    lemma: "precisar", mood: "indicative", tense: "imperfect",
    form: "precisava",
    knownEN: "he/she used to need",
    exampleEN: "He used to need more time to finish",
    examplePT: "Ele precisava de mais tempo para terminar",
  },
  {
    lemma: "entender", mood: "indicative", tense: "imperfect",
    form: "entendia",
    knownEN: "he/she used to understand",
    exampleEN: "She used to understand everything he said",
    examplePT: "Ela entendia tudo o que ele dizia",
  },
  {
    lemma: "comer", mood: "indicative", tense: "imperfect",
    form: "comia",
    knownEN: "he/she used to eat",
    exampleEN: "He used to eat bread for breakfast",
    examplePT: "Ele comia pão no café da manhã",
  },
  {
    lemma: "abrir", mood: "indicative", tense: "imperfect",
    form: "abria",
    knownEN: "he/she used to open",
    exampleEN: "She used to open the window every morning",
    examplePT: "Ela abria a janela toda manhã",
  },
  {
    lemma: "partir", mood: "indicative", tense: "imperfect",
    form: "partia",
    knownEN: "he/she used to leave",
    exampleEN: "He used to leave early for work",
    examplePT: "Ele partia cedo para o trabalho",
  },
  {
    lemma: "ser", mood: "indicative", tense: "imperfect",
    form: "era",
    knownEN: "he/she used to be (essence)",
    exampleEN: "She used to be very shy as a child",
    examplePT: "Ela era muito tímida quando criança",
  },
  {
    lemma: "estar", mood: "indicative", tense: "imperfect",
    form: "estava",
    knownEN: "he/she used to be (state)",
    exampleEN: "He was always tired after dinner",
    examplePT: "Ele estava sempre cansado depois do jantar",
  },
  {
    lemma: "ir", mood: "indicative", tense: "imperfect",
    form: "ia",
    knownEN: "he/she used to go",
    exampleEN: "She used to go to the market every Wednesday",
    examplePT: "Ela ia ao mercado todas as quartas",
  },
  // ter.imperfect.3sg — orphan exists, only WIRE the bundle (no insert)
  {
    lemma: "ter", mood: "indicative", tense: "imperfect",
    form: "tinha",
    wireOnly: true,  // entry already in verb.js
  },
  {
    lemma: "poder", mood: "indicative", tense: "imperfect",
    form: "podia",
    knownEN: "he/she used to be able",
    exampleEN: "He could carry two suitcases without difficulty",
    examplePT: "Ele podia carregar duas malas sem dificuldade",
  },
  {
    lemma: "querer", mood: "indicative", tense: "imperfect",
    form: "queria",
    knownEN: "he/she wanted / he/she would like",
    exampleEN: "She used to want to go to the cinema every Friday",
    examplePT: "Ela queria ir ao cinema toda sexta",
  },
  {
    lemma: "saber", mood: "indicative", tense: "imperfect",
    form: "sabia",
    knownEN: "he/she used to know",
    exampleEN: "He used to know the name of every neighbor",
    examplePT: "Ele sabia o nome de todos os vizinhos",
  },
  {
    lemma: "fazer", mood: "indicative", tense: "imperfect",
    form: "fazia",
    knownEN: "he/she used to do / make",
    exampleEN: "She used to make cake every Sunday",
    examplePT: "Ela fazia bolo todo domingo",
  },

  // ── conditional ─────────────────────────────────────────────────────
  {
    lemma: "falar", mood: "conditional", tense: null,
    form: "falaria",
    knownEN: "he/she would speak",
    exampleEN: "He would speak with you if he had time",
    examplePT: "Ele falaria com você se tivesse tempo",
  },
  {
    lemma: "precisar", mood: "conditional", tense: null,
    form: "precisaria",
    knownEN: "he/she would need",
    exampleEN: "She would need help to move the couch",
    examplePT: "Ela precisaria de ajuda para mover o sofá",
  },
  {
    lemma: "entender", mood: "conditional", tense: null,
    form: "entenderia",
    knownEN: "he/she would understand",
    exampleEN: "He would understand better with an example",
    examplePT: "Ele entenderia melhor com um exemplo",
  },
  {
    lemma: "comer", mood: "conditional", tense: null,
    form: "comeria",
    knownEN: "he/she would eat",
    exampleEN: "She would eat pizza every day if she could",
    examplePT: "Ela comeria pizza todo dia se pudesse",
  },
  {
    lemma: "abrir", mood: "conditional", tense: null,
    form: "abriria",
    knownEN: "he/she would open",
    exampleEN: "He would open the door for you",
    examplePT: "Ele abriria a porta para você",
  },
  {
    lemma: "partir", mood: "conditional", tense: null,
    form: "partiria",
    knownEN: "he/she would leave",
    exampleEN: "She would leave tomorrow if the weather improved",
    examplePT: "Ela partiria amanhã se o tempo melhorasse",
  },
  {
    lemma: "ser", mood: "conditional", tense: null,
    form: "seria",
    knownEN: "he/she would be",
    exampleEN: "He would be a good teacher",
    examplePT: "Ele seria um bom professor",
  },
  {
    lemma: "estar", mood: "conditional", tense: null,
    form: "estaria",
    knownEN: "he/she would be (state)",
    exampleEN: "She would be happier with a dog",
    examplePT: "Ela estaria mais feliz com um cachorro",
  },
  {
    lemma: "ir", mood: "conditional", tense: null,
    form: "iria",
    knownEN: "he/she would go",
    exampleEN: "He would go to the show if he had a ticket",
    examplePT: "Ele iria ao show se tivesse ingresso",
  },
  {
    lemma: "ter", mood: "conditional", tense: null,
    form: "teria",
    knownEN: "he/she would have",
    exampleEN: "She would have more time if she woke up early",
    examplePT: "Ela teria mais tempo se acordasse cedo",
  },
  {
    lemma: "poder", mood: "conditional", tense: null,
    form: "poderia",
    knownEN: "he/she could (polite)",
    exampleEN: "He could help tomorrow morning",
    examplePT: "Ele poderia ajudar amanhã pela manhã",
  },
  // querer.conditional — colloquial: replace `quereria` with `queria` on 1sg AND 3sg
  {
    lemma: "querer", mood: "conditional", tense: null,
    form: "queria",
    knownEN: "he/she would like",
    exampleEN: "She would like a coffee, please",
    examplePT: "Ela queria um café, por favor",
  },
  {
    lemma: "saber", mood: "conditional", tense: null,
    form: "saberia",
    knownEN: "he/she would know",
    exampleEN: "He would know the answer if he studied",
    examplePT: "Ele saberia a resposta se estudasse",
  },
  {
    lemma: "fazer", mood: "conditional", tense: null,
    form: "faria",
    knownEN: "he/she would do / make",
    exampleEN: "She would do anything for her children",
    examplePT: "Ela faria qualquer coisa pelos filhos",
  },

  // ── present.subjunctive (12 — ter, poder skipped: already 4-cell) ──
  {
    lemma: "falar", mood: "subjunctive", tense: "present",
    form: "fale",
    knownEN: "(that) he/she speak",
    exampleEN: "I hope (that) she speaks with me tomorrow",
    examplePT: "Espero que ela fale comigo amanhã",
  },
  {
    lemma: "precisar", mood: "subjunctive", tense: "present",
    form: "precise",
    knownEN: "(that) he/she need",
    exampleEN: "In case he needs anything, let me know",
    examplePT: "Caso ele precise de algo, me avise",
  },
  {
    lemma: "entender", mood: "subjunctive", tense: "present",
    form: "entenda",
    knownEN: "(that) he/she understand",
    exampleEN: "I want (that) she understand the situation",
    examplePT: "Quero que ela entenda a situação",
  },
  {
    lemma: "comer", mood: "subjunctive", tense: "present",
    form: "coma",
    knownEN: "(that) he/she eat",
    exampleEN: "It is important (that) he eat vegetables",
    examplePT: "É importante que ele coma legumes",
  },
  {
    lemma: "abrir", mood: "subjunctive", tense: "present",
    form: "abra",
    knownEN: "(that) he/she open",
    exampleEN: "I ask (that) she open the door slowly",
    examplePT: "Peço que ela abra a porta devagar",
  },
  {
    lemma: "partir", mood: "subjunctive", tense: "present",
    form: "parta",
    knownEN: "(that) he/she leave",
    exampleEN: "I hope (that) he leave soon",
    examplePT: "Espero que ele parta logo",
  },
  {
    lemma: "ser", mood: "subjunctive", tense: "present",
    form: "seja",
    knownEN: "(that) he/she be (essence)",
    exampleEN: "Hopefully (that) she be honest with us",
    examplePT: "Tomara que ela seja honesta conosco",
  },
  {
    lemma: "estar", mood: "subjunctive", tense: "present",
    form: "esteja",
    knownEN: "(that) he/she be (state)",
    exampleEN: "I hope (that) he be well today",
    examplePT: "Espero que ele esteja bem hoje",
  },
  {
    lemma: "ir", mood: "subjunctive", tense: "present",
    form: "vá",
    knownEN: "(that) he/she go",
    exampleEN: "I want (that) she go to the doctor",
    examplePT: "Quero que ela vá ao médico",
  },
  {
    lemma: "querer", mood: "subjunctive", tense: "present",
    form: "queira",
    knownEN: "(that) he/she want",
    exampleEN: "In case he wants help, call me",
    examplePT: "Caso ele queira ajuda, me chame",
  },
  {
    lemma: "saber", mood: "subjunctive", tense: "present",
    form: "saiba",
    knownEN: "(that) he/she know",
    exampleEN: "I hope (that) she know the truth",
    examplePT: "Espero que ela saiba a verdade",
  },
  {
    lemma: "fazer", mood: "subjunctive", tense: "present",
    form: "faça",
    knownEN: "(that) he/she do / make",
    exampleEN: "I want (that) he do the work properly",
    examplePT: "Quero que ele faça o trabalho direito",
  },
];

// querer.conditional.1sg modification — change quereria → queria + new RANKED
export const MODIFY_1SG = {
  slug: "querer.verb.conditional.first.singular",
  newLearning: "queria",
  newKnownEN: "I would like",
  newExampleEN: "I would like a table for two, please",
  newExamplePT: "Eu queria uma mesa para dois, por favor",
  // RANKED for "queria": copy from querer.imperfect.indicative.first.singular
  // (same surface form → same wordfreq) — { rank: 2951, zipf: 5.53, fpm: 339 }
};

// All bundles needing thirdSingular wired (slug = bundle slug)
export const BUNDLES_TO_PATCH = [
  // imperfect.indicative
  "falar.imperfect.indicative", "precisar.imperfect.indicative",
  "entender.imperfect.indicative", "comer.imperfect.indicative",
  "abrir.imperfect.indicative", "partir.imperfect.indicative",
  "ser.imperfect.indicative", "estar.imperfect.indicative",
  "ir.imperfect.indicative", "ter.imperfect.indicative",
  "poder.imperfect.indicative", "querer.imperfect.indicative",
  "saber.imperfect.indicative", "fazer.imperfect.indicative",
  // conditional
  "falar.conditional", "precisar.conditional", "entender.conditional",
  "comer.conditional", "abrir.conditional", "partir.conditional",
  "ser.conditional", "estar.conditional", "ir.conditional",
  "ter.conditional", "poder.conditional", "querer.conditional",
  "saber.conditional", "fazer.conditional",
  // present.subjunctive (skip ter, poder — already 4-cell)
  "falar.present.subjunctive", "precisar.present.subjunctive",
  "entender.present.subjunctive", "comer.present.subjunctive",
  "abrir.present.subjunctive", "partir.present.subjunctive",
  "ser.present.subjunctive", "estar.present.subjunctive",
  "ir.present.subjunctive", "querer.present.subjunctive",
  "saber.present.subjunctive", "fazer.present.subjunctive",
];
