export default [
  {
    slug: "oi-tudo-bem",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      VOCALIZED: null,
      TRANSLATED: {
        known: "Hi, how are you?",
        learning: "Oi, tudo bem?",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Oi",
            gloss: "hi",
            deprel: "discourse",
            index: 0,
            literal: "oi.interjection",
          },
          {
            form: "tudo",
            gloss: "everything",
            deprel: "nsubj",
            index: 1,
            literal: "tudo.pronoun",
          },
          {
            form: "bem",
            gloss: "well",
            deprel: "root",
            index: 2,
            literal: "bem.adverb",
          },
        ],
      },
      RANKED: {
        rank: 1,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.interrogative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.interrogative-type.polar",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "tudo-bem-obrigado",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "Fine, thank you.",
        learning: "Tudo bem, obrigado.",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Tudo",
            gloss: "everything",
            deprel: "nsubj",
            index: 0,
            literal: "tudo.pronoun",
          },
          {
            form: "bem",
            gloss: "well",
            deprel: "root",
            index: 1,
            literal: "bem.adverb",
          },
          {
            form: "obrigado",
            gloss: "thank you",
            deprel: "discourse",
            index: 2,
            literal: "obrigado.interjection",
          },
        ],
      },
      RANKED: {
        rank: 2,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.polite",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "meu-nome-e-eva",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "My name is Eva.",
        learning: "Meu nome é Eva.",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Meu",
            gloss: "my",
            deprel: "det",
            index: 0,
            literal: "meu.determiner",
          },
          {
            form: "nome",
            gloss: "name",
            deprel: "nsubj",
            index: 1,
            literal: "nome.noun",
          },
          {
            form: "é",
            gloss: "is",
            deprel: "cop",
            index: 2,
            literal: "ser.verb.indicative.present.third.singular",
          },
          {
            form: "Eva",
            gloss: "Eva",
            deprel: "root",
            index: 3,
            literal: "eva.proper-noun",
          },
        ],
      },
      RANKED: {
        rank: 3,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "qual-e-o-seu-nome",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "What is your name?",
        learning: "Qual é o seu nome?",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Qual",
            gloss: "which",
            deprel: "nsubj",
            index: 0,
            literal: "qual.pronoun",
          },
          {
            form: "é",
            gloss: "is",
            deprel: "cop",
            index: 1,
            literal: "ser.verb.indicative.present.third.singular",
          },
          {
            form: "o",
            gloss: "the",
            deprel: "det",
            index: 2,
            literal: "o.determiner",
          },
          {
            form: "seu",
            gloss: "your",
            deprel: "det",
            index: 3,
            literal: "seu.determiner",
          },
          {
            form: "nome",
            gloss: "name",
            deprel: "root",
            index: 4,
            literal: "nome.noun",
          },
        ],
      },
      RANKED: {
        rank: 4,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.interrogative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.interrogative-type.content",
      },
      {
        slug: "sentence.wh-element.what",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "bom-dia-como-voce-esta",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "Good morning, how are you?",
        learning: "Bom dia, como você está?",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Bom",
            gloss: "good",
            deprel: "amod",
            index: 0,
            literal: "bom.adjective",
          },
          {
            form: "dia",
            gloss: "day",
            deprel: "root",
            index: 1,
            literal: "dia.noun",
          },
          {
            form: "como",
            gloss: "how",
            deprel: "advmod",
            index: 2,
            literal: "como.subordinating-conjunction",
          },
          {
            form: "você",
            gloss: "you",
            deprel: "nsubj",
            index: 3,
            literal: "você.pronoun",
          },
          {
            form: "está",
            gloss: "are",
            deprel: "parataxis",
            index: 4,
            literal: "estar.verb.indicative.present.third.singular",
          },
        ],
      },
      RANKED: {
        rank: 5,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.interrogative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.interrogative-type.content",
      },
      {
        slug: "sentence.wh-element.how",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "boa-tarde-prazer",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "Good afternoon, nice to meet you.",
        learning: "Boa tarde, prazer em te conhecer.",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Boa",
            gloss: "good",
            deprel: "amod",
            index: 0,
            literal: "bom.adjective",
          },
          {
            form: "tarde",
            gloss: "afternoon",
            deprel: "root",
            index: 1,
            literal: "tarde.noun",
          },
          {
            form: "prazer",
            gloss: "pleasure",
            deprel: "parataxis",
            index: 2,
            literal: "prazer.noun",
          },
          {
            form: "em",
            gloss: "in",
            deprel: "mark",
            index: 3,
            literal: "em.adposition",
          },
          {
            form: "te",
            gloss: "you",
            deprel: "obj",
            index: 4,
            literal: "te.pronoun",
          },
          {
            form: "conhecer",
            gloss: "meet",
            deprel: "nmod",
            index: 5,
            literal: "conhecer.verb.infinitive",
          },
        ],
      },
      RANKED: {
        rank: 6,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.polite",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "boa-noite-ela-esta-cansada",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "Good night, she is tired.",
        learning: "Boa noite, ela está cansada.",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Boa",
            gloss: "good",
            deprel: "amod",
            index: 0,
            literal: "bom.adjective",
          },
          {
            form: "noite",
            gloss: "night",
            deprel: "root",
            index: 1,
            literal: "noite.noun",
          },
          {
            form: "ela",
            gloss: "she",
            deprel: "nsubj",
            index: 2,
            literal: "ela.pronoun",
          },
          {
            form: "está",
            gloss: "is",
            deprel: "parataxis",
            index: 3,
            literal: "estar.verb.indicative.present.third.singular",
          },
          {
            form: "cansada",
            gloss: "tired",
            deprel: "xcomp",
            index: 4,
            literal: "cansado.adjective",
          },
        ],
      },
      RANKED: {
        rank: 7,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "tchau-ate-amanha",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "Bye, see you tomorrow.",
        learning: "Tchau, até amanhã.",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Tchau",
            gloss: "bye",
            deprel: "root",
            index: 0,
            literal: "tchau.interjection",
          },
          {
            form: "até",
            gloss: "until",
            deprel: "case",
            index: 1,
            literal: "até.adposition",
          },
          {
            form: "amanhã",
            gloss: "tomorrow",
            deprel: "obl",
            index: 2,
            literal: "amanhã.adverb",
          },
        ],
      },
      RANKED: {
        rank: 8,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "voce-fala-ingles",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "Do you speak English?",
        learning: "Você fala inglês?",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Você",
            gloss: "you",
            deprel: "nsubj",
            index: 0,
            literal: "você.pronoun",
          },
          {
            form: "fala",
            gloss: "speak",
            deprel: "root",
            index: 1,
            literal: "falar.verb.indicative.present.third.singular",
          },
          {
            form: "inglês",
            gloss: "English",
            deprel: "obj",
            index: 2,
            literal: "inglês.noun",
          },
        ],
      },
      RANKED: {
        rank: 9,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.interrogative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.interrogative-type.polar",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "sim-um-pouco",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "Yes, a little.",
        learning: "Sim, um pouco.",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Sim",
            gloss: "yes",
            deprel: "root",
            index: 0,
            literal: "sim.adverb",
          },
          {
            form: "um",
            gloss: "a",
            deprel: "det",
            index: 1,
            literal: "um.determiner",
          },
          {
            form: "pouco",
            gloss: "little",
            deprel: "nmod",
            index: 2,
            literal: "pouco.adverb",
          },
        ],
      },
      RANKED: {
        rank: 10,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "ela-nao-fala-portugues",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "She doesn't speak Portuguese.",
        learning: "Ela não fala português.",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Ela",
            gloss: "she",
            deprel: "nsubj",
            index: 0,
            literal: "ela.pronoun",
          },
          {
            form: "não",
            gloss: "not",
            deprel: "advmod",
            index: 1,
            literal: "não.adverb",
          },
          {
            form: "fala",
            gloss: "speak",
            deprel: "root",
            index: 2,
            literal: "falar.verb.indicative.present.third.singular",
          },
          {
            form: "português",
            gloss: "Portuguese",
            deprel: "obj",
            index: 3,
            literal: "português.noun",
          },
        ],
      },
      RANKED: {
        rank: 11,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.negative",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "eu-nao-entendo-desculpa",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "I don't understand, sorry.",
        learning: "Eu não entendo, desculpa.",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Eu",
            gloss: "I",
            deprel: "nsubj",
            index: 0,
            literal: "eu.pronoun",
          },
          {
            form: "não",
            gloss: "not",
            deprel: "advmod",
            index: 1,
            literal: "não.adverb",
          },
          {
            form: "entendo",
            gloss: "understand",
            deprel: "root",
            index: 2,
            literal: "entender.verb.indicative.present.first.singular",
          },
          {
            form: "desculpa",
            gloss: "sorry",
            deprel: "discourse",
            index: 3,
            literal: "desculpa.interjection",
          },
        ],
      },
      RANKED: {
        rank: 12,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.negative",
      },
      {
        slug: "sentence.politeness.polite",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "pode-falar-mais-devagar",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "Can you speak more slowly, please?",
        learning: "Pode falar mais devagar, por favor?",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Pode",
            gloss: "can",
            deprel: "root",
            index: 0,
            literal: "poder.verb.indicative.present.third.singular",
          },
          {
            form: "falar",
            gloss: "speak",
            deprel: "xcomp",
            index: 1,
            literal: "falar.verb.infinitive",
          },
          {
            form: "mais",
            gloss: "more",
            deprel: "advmod",
            index: 2,
            literal: "mais.adverb",
          },
          {
            form: "devagar",
            gloss: "slowly",
            deprel: "advmod",
            index: 3,
            literal: "devagar.adverb",
          },
          {
            form: "por",
            gloss: "for",
            deprel: "case",
            index: 4,
            literal: "por.adposition",
          },
          {
            form: "favor",
            gloss: "favor",
            deprel: "obl",
            index: 5,
            literal: "favor.noun",
          },
        ],
      },
      RANKED: {
        rank: 13,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.interrogative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.interrogative-type.polar",
      },
      {
        slug: "sentence.politeness.polite",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "com-licenca-onde-fica-o-banheiro",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "Excuse me, where is the bathroom?",
        learning: "Com licença, onde fica o banheiro?",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Com",
            gloss: "with",
            deprel: "case",
            index: 0,
            literal: "com.adposition",
          },
          {
            form: "licença",
            gloss: "permission",
            deprel: "discourse",
            index: 1,
            literal: "licença.noun",
          },
          {
            form: "onde",
            gloss: "where",
            deprel: "advmod",
            index: 2,
            literal: "onde.adverb",
          },
          {
            form: "fica",
            gloss: "is located",
            deprel: "root",
            index: 3,
            literal: "ficar.verb.indicative.present.third.singular",
          },
          {
            form: "o",
            gloss: "the",
            deprel: "det",
            index: 4,
            literal: "o.determiner",
          },
          {
            form: "banheiro",
            gloss: "bathroom",
            deprel: "nsubj",
            index: 5,
            literal: "banheiro.noun",
          },
        ],
      },
      RANKED: {
        rank: 14,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.interrogative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.interrogative-type.content",
      },
      {
        slug: "sentence.wh-element.where",
      },
      {
        slug: "sentence.politeness.polite",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "onde-fica-o-ponto-de-onibus",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "Where is the bus stop?",
        learning: "Onde fica o ponto de ônibus?",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Onde",
            gloss: "where",
            deprel: "advmod",
            index: 0,
            literal: "onde.adverb",
          },
          {
            form: "fica",
            gloss: "is located",
            deprel: "root",
            index: 1,
            literal: "ficar.verb.indicative.present.third.singular",
          },
          {
            form: "o",
            gloss: "the",
            deprel: "det",
            index: 2,
            literal: "o.determiner",
          },
          {
            form: "ponto",
            gloss: "stop",
            deprel: "nsubj",
            index: 3,
            literal: "ponto.noun",
          },
          {
            form: "de",
            gloss: "of",
            deprel: "case",
            index: 4,
            literal: "de.adposition",
          },
          {
            form: "ônibus",
            gloss: "bus",
            deprel: "nmod",
            index: 5,
            literal: "ônibus.noun",
          },
        ],
      },
      RANKED: {
        rank: 15,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.interrogative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.interrogative-type.content",
      },
      {
        slug: "sentence.wh-element.where",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "onde-fica-o-mercado-mais-proximo",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "Where is the nearest supermarket?",
        learning: "Onde fica o mercado mais próximo?",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Onde",
            gloss: "where",
            deprel: "advmod",
            index: 0,
            literal: "onde.adverb",
          },
          {
            form: "fica",
            gloss: "is located",
            deprel: "root",
            index: 1,
            literal: "ficar.verb.indicative.present.third.singular",
          },
          {
            form: "o",
            gloss: "the",
            deprel: "det",
            index: 2,
            literal: "o.determiner",
          },
          {
            form: "mercado",
            gloss: "market",
            deprel: "nsubj",
            index: 3,
            literal: "mercado.noun",
          },
          {
            form: "mais",
            gloss: "most",
            deprel: "advmod",
            index: 4,
            literal: "mais.adverb",
          },
          {
            form: "próximo",
            gloss: "nearby",
            deprel: "amod",
            index: 5,
            literal: "próximo.adjective",
          },
        ],
      },
      RANKED: {
        rank: 16,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.interrogative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.interrogative-type.content",
      },
      {
        slug: "sentence.wh-element.where",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "o-que-e-isso",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "What is this?",
        learning: "O que é isso?",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "O",
            gloss: "the",
            deprel: "det",
            index: 0,
            literal: "o.determiner",
          },
          {
            form: "que",
            gloss: "what",
            deprel: "nsubj",
            index: 1,
            literal: "que.pron.int",
          },
          {
            form: "é",
            gloss: "is",
            deprel: "root",
            index: 2,
            literal: "ser.verb.indicative.present.third.singular",
          },
          {
            form: "isso",
            gloss: "this",
            deprel: "nsubj",
            index: 3,
            literal: "isso.pronoun",
          },
        ],
      },
      RANKED: {
        rank: 17,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.interrogative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.interrogative-type.content",
      },
      {
        slug: "sentence.wh-element.what",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "quem-e-ela",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "Who is she?",
        learning: "Quem é ela?",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Quem",
            gloss: "who",
            deprel: "nsubj",
            index: 0,
            literal: "quem.pronoun",
          },
          {
            form: "é",
            gloss: "is",
            deprel: "root",
            index: 1,
            literal: "ser.verb.indicative.present.third.singular",
          },
          {
            form: "ela",
            gloss: "she",
            deprel: "nsubj",
            index: 2,
            literal: "ela.pronoun",
          },
        ],
      },
      RANKED: {
        rank: 18,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.interrogative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.interrogative-type.content",
      },
      {
        slug: "sentence.wh-element.who",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "qual-e-o-seu-numero",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "What is your number?",
        learning: "Qual é o seu número?",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Qual",
            gloss: "which",
            deprel: "nsubj",
            index: 0,
            literal: "qual.pronoun",
          },
          {
            form: "é",
            gloss: "is",
            deprel: "cop",
            index: 1,
            literal: "ser.verb.indicative.present.third.singular",
          },
          {
            form: "o",
            gloss: "the",
            deprel: "det",
            index: 2,
            literal: "o.determiner",
          },
          {
            form: "seu",
            gloss: "your",
            deprel: "det",
            index: 3,
            literal: "seu.determiner",
          },
          {
            form: "número",
            gloss: "number",
            deprel: "root",
            index: 4,
            literal: "número.noun",
          },
        ],
      },
      RANKED: {
        rank: 19,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.interrogative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.interrogative-type.content",
      },
      {
        slug: "sentence.wh-element.which",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "quanto-custa-isso",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "How much does this cost?",
        learning: "Quanto custa isso?",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Quanto",
            gloss: "how much",
            deprel: "advmod",
            index: 0,
            literal: "quanto.pronoun",
          },
          {
            form: "custa",
            gloss: "costs",
            deprel: "root",
            index: 1,
            literal: "custar.verb.indicative.present.third.singular",
          },
          {
            form: "isso",
            gloss: "this",
            deprel: "nsubj",
            index: 2,
            literal: "isso.pronoun",
          },
        ],
      },
      RANKED: {
        rank: 20,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.interrogative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.interrogative-type.content",
      },
      {
        slug: "sentence.wh-element.how-many",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "que-horas-sao",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "What time is it?",
        learning: "Que horas são?",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Que",
            gloss: "what",
            deprel: "det",
            index: 0,
            literal: "que.pron.int",
          },
          {
            form: "horas",
            gloss: "hours",
            deprel: "nsubj",
            index: 1,
            literal: "hora.noun",
          },
          {
            form: "são",
            gloss: "are",
            deprel: "root",
            index: 2,
            literal: "ser.verb.indicative.present.third.plural",
          },
        ],
      },
      RANKED: {
        rank: 21,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.interrogative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.interrogative-type.content",
      },
      {
        slug: "sentence.wh-element.what",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "quando-o-onibus-chega",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "When does the bus arrive?",
        learning: "Quando o ônibus chega?",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Quando",
            gloss: "when",
            deprel: "advmod",
            index: 0,
            literal: "quando.adverb",
          },
          {
            form: "o",
            gloss: "the",
            deprel: "det",
            index: 1,
            literal: "o.determiner",
          },
          {
            form: "ônibus",
            gloss: "bus",
            deprel: "nsubj",
            index: 2,
            literal: "ônibus.noun",
          },
          {
            form: "chega",
            gloss: "arrives",
            deprel: "root",
            index: 3,
            literal: "chegar.verb.indicative.present.third.singular",
          },
        ],
      },
      RANKED: {
        rank: 22,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.interrogative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.interrogative-type.content",
      },
      {
        slug: "sentence.wh-element.when",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "por-que-isso-e-tao-caro",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "Why is this so expensive?",
        learning: "Por que isso é tão caro?",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Por",
            gloss: "for",
            deprel: "case",
            index: 0,
            literal: "por.adposition",
          },
          {
            form: "que",
            gloss: "what",
            deprel: "advmod",
            index: 1,
            literal: "que.pron.int",
          },
          {
            form: "isso",
            gloss: "this",
            deprel: "nsubj",
            index: 2,
            literal: "isso.pronoun",
          },
          {
            form: "é",
            gloss: "is",
            deprel: "root",
            index: 3,
            literal: "ser.verb.indicative.present.third.singular",
          },
          {
            form: "tão",
            gloss: "so",
            deprel: "advmod",
            index: 4,
            literal: "tão.adverb",
          },
          {
            form: "caro",
            gloss: "expensive",
            deprel: "xcomp",
            index: 5,
            literal: "caro.adjective",
          },
        ],
      },
      RANKED: {
        rank: 23,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.interrogative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.interrogative-type.content",
      },
      {
        slug: "sentence.wh-element.why",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "aceita-cartao-ou-dinheiro",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "Do you accept card or cash?",
        learning: "Aceita cartão ou dinheiro?",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Aceita",
            gloss: "accept",
            deprel: "root",
            index: 0,
            literal: "aceitar.verb.indicative.present.third.singular",
          },
          {
            form: "cartão",
            gloss: "card",
            deprel: "obj",
            index: 1,
            literal: "cartão.noun",
          },
          {
            form: "ou",
            gloss: "or",
            deprel: "cc",
            index: 2,
            literal: "ou.coordinating-conjunction",
          },
          {
            form: "dinheiro",
            gloss: "cash",
            deprel: "conj",
            index: 3,
            literal: "dinheiro.noun",
          },
        ],
      },
      RANKED: {
        rank: 24,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.interrogative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.interrogative-type.alternative",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "eu-quero-pagar-a-conta",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "I want to pay the bill.",
        learning: "Eu quero pagar a conta.",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Eu",
            gloss: "I",
            deprel: "nsubj",
            index: 0,
            literal: "eu.pronoun",
          },
          {
            form: "quero",
            gloss: "want",
            deprel: "root",
            index: 1,
            literal: "querer.verb.indicative.present.first.singular",
          },
          {
            form: "pagar",
            gloss: "pay",
            deprel: "xcomp",
            index: 2,
            literal: "pagar.verb.infinitive",
          },
          {
            form: "a",
            gloss: "the",
            deprel: "det",
            index: 3,
            literal: "a.determiner",
          },
          {
            form: "conta",
            gloss: "bill",
            deprel: "obj",
            index: 4,
            literal: "conta.noun",
          },
        ],
      },
      RANKED: {
        rank: 25,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "uma-cerveja-por-favor",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "A beer, please.",
        learning: "Uma cerveja, por favor.",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Uma",
            gloss: "a",
            deprel: "det",
            index: 0,
            literal: "uma.determiner",
          },
          {
            form: "cerveja",
            gloss: "beer",
            deprel: "root",
            index: 1,
            literal: "cerveja.noun",
          },
          {
            form: "por",
            gloss: "for",
            deprel: "case",
            index: 2,
            literal: "por.adposition",
          },
          {
            form: "favor",
            gloss: "favor",
            deprel: "obl",
            index: 3,
            literal: "favor.noun",
          },
        ],
      },
      RANKED: {
        rank: 26,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.polite",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "agua-e-cafe-por-favor",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "Water and coffee, please.",
        learning: "Água e café, por favor.",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Água",
            gloss: "water",
            deprel: "root",
            index: 0,
            literal: "água.noun",
          },
          {
            form: "e",
            gloss: "and",
            deprel: "cc",
            index: 1,
            literal: "e.coordinating-conjunction",
          },
          {
            form: "café",
            gloss: "coffee",
            deprel: "conj",
            index: 2,
            literal: "café.noun",
          },
          {
            form: "por",
            gloss: "for",
            deprel: "case",
            index: 3,
            literal: "por.adposition",
          },
          {
            form: "favor",
            gloss: "favor",
            deprel: "obl",
            index: 4,
            literal: "favor.noun",
          },
        ],
      },
      RANKED: {
        rank: 27,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.polite",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "estou-com-sede-voce-tem-cerveja",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "I'm thirsty, do you have beer?",
        learning: "Estou com sede, você tem cerveja?",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Estou",
            gloss: "am",
            deprel: "root",
            index: 0,
            literal: "estar.verb.indicative.present.first.singular",
          },
          {
            form: "com",
            gloss: "with",
            deprel: "case",
            index: 1,
            literal: "com.adposition",
          },
          {
            form: "sede",
            gloss: "thirst",
            deprel: "obl",
            index: 2,
            literal: "sede.noun",
          },
          {
            form: "você",
            gloss: "you",
            deprel: "nsubj",
            index: 3,
            literal: "você.pronoun",
          },
          {
            form: "tem",
            gloss: "have",
            deprel: "parataxis",
            index: 4,
            literal: "ter.verb.indicative.present.third.singular",
          },
          {
            form: "cerveja",
            gloss: "beer",
            deprel: "obj",
            index: 5,
            literal: "cerveja.noun",
          },
        ],
      },
      RANKED: {
        rank: 28,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.interrogative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.interrogative-type.polar",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "a-comida-esta-muito-boa",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "The food is very good.",
        learning: "A comida está muito boa.",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "A",
            gloss: "the",
            deprel: "det",
            index: 0,
            literal: "a.determiner",
          },
          {
            form: "comida",
            gloss: "food",
            deprel: "nsubj",
            index: 1,
            literal: "comida.noun",
          },
          {
            form: "está",
            gloss: "is",
            deprel: "root",
            index: 2,
            literal: "estar.verb.indicative.present.third.singular",
          },
          {
            form: "muito",
            gloss: "very",
            deprel: "advmod",
            index: 3,
            literal: "muito.adverb",
          },
          {
            form: "boa",
            gloss: "good",
            deprel: "xcomp",
            index: 4,
            literal: "bom.adjective",
          },
        ],
      },
      RANKED: {
        rank: 29,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "eu-preciso-de-um-taxi-agora",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "I need a taxi now.",
        learning: "Eu preciso de um táxi agora.",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Eu",
            gloss: "I",
            deprel: "nsubj",
            index: 0,
            literal: "eu.pronoun",
          },
          {
            form: "preciso",
            gloss: "need",
            deprel: "root",
            index: 1,
            literal: "precisar.verb.indicative.present.first.singular",
          },
          {
            form: "de",
            gloss: "of",
            deprel: "case",
            index: 2,
            literal: "de.adposition",
          },
          {
            form: "um",
            gloss: "a",
            deprel: "det",
            index: 3,
            literal: "um.determiner",
          },
          {
            form: "táxi",
            gloss: "taxi",
            deprel: "obl",
            index: 4,
            literal: "táxi.noun",
          },
          {
            form: "agora",
            gloss: "now",
            deprel: "advmod",
            index: 5,
            literal: "agora.adverb",
          },
        ],
      },
      RANKED: {
        rank: 30,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "ela-vai-pra-praia-hoje",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "She's going to the beach today.",
        learning: "Ela vai pra praia hoje.",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Ela",
            gloss: "she",
            deprel: "nsubj",
            index: 0,
            literal: "ela.pronoun",
          },
          {
            form: "vai",
            gloss: "goes",
            deprel: "root",
            index: 1,
            literal: "ir.verb.indicative.present.third.singular",
          },
          {
            form: "pra",
            gloss: "to",
            deprel: "case",
            index: 2,
            literal: "para.adposition",
          },
          {
            form: "praia",
            gloss: "beach",
            deprel: "obl",
            index: 3,
            literal: "praia.noun",
          },
          {
            form: "hoje",
            gloss: "today",
            deprel: "advmod",
            index: 4,
            literal: "hoje.adverb",
          },
        ],
      },
      RANKED: {
        rank: 31,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "vamos-pra-casa-agora",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "Let's go home now.",
        learning: "Vamos pra casa agora.",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Vamos",
            gloss: "let's go",
            deprel: "root",
            index: 0,
            literal: "ir.verb.indicative.present.first.plural",
          },
          {
            form: "pra",
            gloss: "to",
            deprel: "case",
            index: 1,
            literal: "para.adposition",
          },
          {
            form: "casa",
            gloss: "home",
            deprel: "obl",
            index: 2,
            literal: "casa.noun",
          },
          {
            form: "agora",
            gloss: "now",
            deprel: "advmod",
            index: 3,
            literal: "agora.adverb",
          },
        ],
      },
      RANKED: {
        rank: 32,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.imperative",
      },
      {
        slug: "sentence.mood.imperative",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "eles-chegam-amanha",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "They arrive tomorrow.",
        learning: "Eles chegam amanhã.",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Eles",
            gloss: "they",
            deprel: "nsubj",
            index: 0,
            literal: "eles.pronoun",
          },
          {
            form: "chegam",
            gloss: "arrive",
            deprel: "root",
            index: 1,
            literal: "chegar.verb.indicative.present.third.plural",
          },
          {
            form: "amanhã",
            gloss: "tomorrow",
            deprel: "advmod",
            index: 2,
            literal: "amanhã.adverb",
          },
        ],
      },
      RANKED: {
        rank: 33,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "ele-nao-entende-nada",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "He doesn't understand anything.",
        learning: "Ele não entende nada.",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Ele",
            gloss: "he",
            deprel: "nsubj",
            index: 0,
            literal: "ele.pronoun",
          },
          {
            form: "não",
            gloss: "not",
            deprel: "advmod",
            index: 1,
            literal: "não.adverb",
          },
          {
            form: "entende",
            gloss: "understands",
            deprel: "root",
            index: 2,
            literal: "entender.verb.indicative.present.third.singular",
          },
          {
            form: "nada",
            gloss: "anything",
            deprel: "obj",
            index: 3,
            literal: "nada.pronoun",
          },
        ],
      },
      RANKED: {
        rank: 34,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.negative",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "nos-estamos-bem-obrigado",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "We are fine, thank you.",
        learning: "Nós estamos bem, obrigado.",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Nós",
            gloss: "we",
            deprel: "nsubj",
            index: 0,
            literal: "nós.pronoun",
          },
          {
            form: "estamos",
            gloss: "are",
            deprel: "root",
            index: 1,
            literal: "estar.verb.indicative.present.first.plural",
          },
          {
            form: "bem",
            gloss: "well",
            deprel: "advmod",
            index: 2,
            literal: "bem.adverb",
          },
          {
            form: "obrigado",
            gloss: "thank you",
            deprel: "discourse",
            index: 3,
            literal: "obrigado.interjection",
          },
        ],
      },
      RANKED: {
        rank: 35,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.polite",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "voce-vai-ao-banco-hoje",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "Are you going to the bank today?",
        learning: "Você vai ao banco hoje?",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Você",
            gloss: "you",
            deprel: "nsubj",
            index: 0,
            literal: "você.pronoun",
          },
          {
            form: "vai",
            gloss: "go",
            deprel: "root",
            index: 1,
            literal: "ir.verb.indicative.present.third.singular",
          },
          {
            form: "ao",
            gloss: "to the",
            deprel: "case",
            index: 2,
            literal: "a.adposition",
          },
          {
            form: "banco",
            gloss: "bank",
            deprel: "obl",
            index: 3,
            literal: "banco.noun",
          },
          {
            form: "hoje",
            gloss: "today",
            deprel: "advmod",
            index: 4,
            literal: "hoje.adverb",
          },
        ],
      },
      RANKED: {
        rank: 36,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.interrogative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.interrogative-type.polar",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "ta-quente-hoje-ne",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "It's hot today, right?",
        learning: "Tá quente hoje, né?",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Tá",
            gloss: "is",
            deprel: "root",
            index: 0,
            literal: "tá.particle",
          },
          {
            form: "quente",
            gloss: "hot",
            deprel: "xcomp",
            index: 1,
            literal: "quente.adjective",
          },
          {
            form: "hoje",
            gloss: "today",
            deprel: "advmod",
            index: 2,
            literal: "hoje.adverb",
          },
          {
            form: "né",
            gloss: "right?",
            deprel: "discourse",
            index: 3,
            literal: "né.particle",
          },
        ],
      },
      RANKED: {
        rank: 37,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.interrogative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.interrogative-type.polar",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "eu-nao-sei-talvez-amanha",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "I don't know, maybe tomorrow.",
        learning: "Eu não sei, talvez amanhã.",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Eu",
            gloss: "I",
            deprel: "nsubj",
            index: 0,
            literal: "eu.pronoun",
          },
          {
            form: "não",
            gloss: "not",
            deprel: "advmod",
            index: 1,
            literal: "não.adverb",
          },
          {
            form: "sei",
            gloss: "know",
            deprel: "root",
            index: 2,
            literal: "saber.verb.indicative.present.first.singular",
          },
          {
            form: "talvez",
            gloss: "maybe",
            deprel: "advmod",
            index: 3,
            literal: "talvez.adverb",
          },
          {
            form: "amanhã",
            gloss: "tomorrow",
            deprel: "advmod",
            index: 4,
            literal: "amanhã.adverb",
          },
        ],
      },
      RANKED: {
        rank: 38,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.negative",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "espera-um-momento-ja-volto",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "Wait a moment, I'll be right back.",
        learning: "Espera um momento, já volto.",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Espera",
            gloss: "wait",
            deprel: "root",
            index: 0,
            literal: "esperar.verb.imperative.third.singular",
          },
          {
            form: "um",
            gloss: "a",
            deprel: "det",
            index: 1,
            literal: "um.determiner",
          },
          {
            form: "momento",
            gloss: "moment",
            deprel: "obj",
            index: 2,
            literal: "momento.noun",
          },
          {
            form: "já",
            gloss: "already",
            deprel: "advmod",
            index: 3,
            literal: "já.adverb",
          },
          {
            form: "volto",
            gloss: "return",
            deprel: "parataxis",
            index: 4,
            literal: "voltar.verb.indicative.present.first.singular",
          },
        ],
      },
      RANKED: {
        rank: 39,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.imperative",
      },
      {
        slug: "sentence.mood.imperative",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "eu-te-ligo-depois",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "I'll call you later.",
        learning: "Eu te ligo depois.",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Eu",
            gloss: "I",
            deprel: "nsubj",
            index: 0,
            literal: "eu.pronoun",
          },
          {
            form: "te",
            gloss: "you",
            deprel: "obj",
            index: 1,
            literal: "te.pronoun",
          },
          {
            form: "ligo",
            gloss: "call",
            deprel: "root",
            index: 2,
            literal: "ligar.verb.indicative.present.first.singular",
          },
          {
            form: "depois",
            gloss: "later",
            deprel: "advmod",
            index: 3,
            literal: "depois.adverb",
          },
        ],
      },
      RANKED: {
        rank: 40,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "eu-sou-o-melhor-pianista-do-mundo",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "I am the best pianist in the world.",
        learning: "Eu sou o melhor pianista do mundo.",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Eu",
            gloss: "I",
            deprel: "nsubj",
            index: 0,
            literal: "eu.pronoun",
          },
          {
            form: "sou",
            gloss: "am",
            deprel: "cop",
            index: 1,
            literal: "ser.verb.indicative.present.first.singular",
          },
          {
            form: "o",
            gloss: "the",
            deprel: "det",
            index: 2,
            literal: "o.determiner",
          },
          {
            form: "melhor",
            gloss: "best",
            deprel: "amod",
            index: 3,
            literal: "melhor.adjective",
          },
          {
            form: "pianista",
            gloss: "pianist",
            deprel: "root",
            index: 4,
            literal: "pianista.noun",
          },
          {
            form: "do",
            gloss: "of the",
            deprel: "case",
            index: 5,
            literal: "de.adposition",
          },
          {
            form: "mundo",
            gloss: "world",
            deprel: "nmod",
            index: 6,
            literal: "mundo.noun",
          },
        ],
      },
      RANKED: {
        rank: 41,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "vira-a-esquerda-depois-a-direita",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "Turn left, then right.",
        learning: "Vira à esquerda, depois à direita.",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Vira",
            gloss: "turn",
            deprel: "root",
            index: 0,
            literal: "virar.verb.imperative.third.singular",
          },
          {
            form: "à",
            gloss: "to the",
            deprel: "case",
            index: 1,
            literal: "a.adposition",
          },
          {
            form: "esquerda",
            gloss: "left",
            deprel: "obl",
            index: 2,
            literal: "esquerda.noun",
          },
          {
            form: "depois",
            gloss: "then",
            deprel: "advmod",
            index: 3,
            literal: "depois.adverb",
          },
          {
            form: "à",
            gloss: "to the",
            deprel: "case",
            index: 4,
            literal: "a.adposition",
          },
          {
            form: "direita",
            gloss: "right",
            deprel: "obl",
            index: 5,
            literal: "direita.noun",
          },
        ],
      },
      RANKED: {
        rank: 42,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.imperative",
      },
      {
        slug: "sentence.mood.imperative",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "quanto-tempo-demora",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "How long does it take?",
        learning: "Quanto tempo demora?",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Quanto",
            gloss: "how much",
            deprel: "advmod",
            index: 0,
            literal: "quanto.pronoun",
          },
          {
            form: "tempo",
            gloss: "time",
            deprel: "nsubj",
            index: 1,
            literal: "tempo.noun",
          },
          {
            form: "demora",
            gloss: "takes",
            deprel: "root",
            index: 2,
            literal: "demorar.verb.indicative.present.third.singular",
          },
        ],
      },
      RANKED: {
        rank: 43,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.interrogative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.interrogative-type.content",
      },
      {
        slug: "sentence.wh-element.how-many",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "tem-wifi-aqui",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "Is there Wi-Fi here?",
        learning: "Tem Wi-Fi aqui?",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Tem",
            gloss: "there is",
            deprel: "root",
            index: 0,
            literal: "ter.verb.indicative.present.third.singular",
          },
          {
            form: "Wi-Fi",
            gloss: "Wi-Fi",
            deprel: "obj",
            index: 1,
            literal: "wifi.noun",
          },
          {
            form: "aqui",
            gloss: "here",
            deprel: "advmod",
            index: 2,
            literal: "aqui.adverb",
          },
        ],
      },
      RANKED: {
        rank: 44,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.interrogative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.interrogative-type.polar",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "eu-quero-um-quarto-para-duas-noites",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "I want a room for two nights.",
        learning: "Eu quero um quarto para duas noites.",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Eu",
            gloss: "I",
            deprel: "nsubj",
            index: 0,
            literal: "eu.pronoun",
          },
          {
            form: "quero",
            gloss: "want",
            deprel: "root",
            index: 1,
            literal: "querer.verb.indicative.present.first.singular",
          },
          {
            form: "um",
            gloss: "a",
            deprel: "det",
            index: 2,
            literal: "um.determiner",
          },
          {
            form: "quarto",
            gloss: "room",
            deprel: "obj",
            index: 3,
            literal: "quarto.noun",
          },
          {
            form: "para",
            gloss: "for",
            deprel: "case",
            index: 4,
            literal: "para.adposition",
          },
          {
            form: "duas",
            gloss: "two",
            deprel: "nummod",
            index: 5,
            literal: "duas.numeral",
          },
          {
            form: "noites",
            gloss: "nights",
            deprel: "nmod",
            index: 6,
            literal: "noite.noun",
          },
        ],
      },
      RANKED: {
        rank: 45,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "pode-me-mostrar-no-mapa",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "Can you show me on the map?",
        learning: "Pode me mostrar no mapa?",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Pode",
            gloss: "can",
            deprel: "root",
            index: 0,
            literal: "poder.verb.indicative.present.third.singular",
          },
          {
            form: "me",
            gloss: "me",
            deprel: "iobj",
            index: 1,
            literal: "me.pronoun",
          },
          {
            form: "mostrar",
            gloss: "show",
            deprel: "xcomp",
            index: 2,
            literal: "mostrar.verb.infinitive",
          },
          {
            form: "no",
            gloss: "on the",
            deprel: "case",
            index: 3,
            literal: "em.adposition",
          },
          {
            form: "mapa",
            gloss: "map",
            deprel: "obl",
            index: 4,
            literal: "mapa.noun",
          },
        ],
      },
      RANKED: {
        rank: 46,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.interrogative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.interrogative-type.polar",
      },
      {
        slug: "sentence.politeness.polite",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "eu-cheguei-ontem-e-vou-embora-amanha",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "I arrived yesterday and will leave tomorrow.",
        learning: "Eu cheguei ontem e vou embora amanhã.",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Eu",
            gloss: "I",
            deprel: "nsubj",
            index: 0,
            literal: "eu.pronoun",
          },
          {
            form: "cheguei",
            gloss: "arrived",
            deprel: "root",
            index: 1,
            literal: "chegar.verb.indicative.past.first.singular",
          },
          {
            form: "ontem",
            gloss: "yesterday",
            deprel: "advmod",
            index: 2,
            literal: "ontem.adverb",
          },
          {
            form: "e",
            gloss: "and",
            deprel: "cc",
            index: 3,
            literal: "e.coordinating-conjunction",
          },
          {
            form: "vou",
            gloss: "go",
            deprel: "conj",
            index: 4,
            literal: "ir.verb.indicative.present.first.singular",
          },
          {
            form: "embora",
            gloss: "away",
            deprel: "advmod",
            index: 5,
            literal: "embora.adverb",
          },
          {
            form: "amanhã",
            gloss: "tomorrow",
            deprel: "advmod",
            index: 6,
            literal: "amanhã.adverb",
          },
        ],
      },
      RANKED: {
        rank: 47,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.past",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "a-porta-esta-fechada-tem-outra-saida",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "The door is closed, is there another exit?",
        learning: "A porta está fechada, tem outra saída?",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "A",
            gloss: "the",
            deprel: "det",
            index: 0,
            literal: "a.determiner",
          },
          {
            form: "porta",
            gloss: "door",
            deprel: "nsubj",
            index: 1,
            literal: "porta.noun",
          },
          {
            form: "está",
            gloss: "is",
            deprel: "root",
            index: 2,
            literal: "estar.verb.indicative.present.third.singular",
          },
          {
            form: "fechada",
            gloss: "closed",
            deprel: "xcomp",
            index: 3,
            literal: "fechado.adjective",
          },
          {
            form: "tem",
            gloss: "there is",
            deprel: "parataxis",
            index: 4,
            literal: "ter.verb.indicative.present.third.singular",
          },
          {
            form: "outra",
            gloss: "another",
            deprel: "det",
            index: 5,
            literal: "outro.adjective",
          },
          {
            form: "saída",
            gloss: "exit",
            deprel: "obj",
            index: 6,
            literal: "saída.noun",
          },
        ],
      },
      RANKED: {
        rank: 48,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.interrogative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.interrogative-type.polar",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "o-hotel-fica-perto-da-praia",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "The hotel is near the beach.",
        learning: "O hotel fica perto da praia.",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "O",
            gloss: "the",
            deprel: "det",
            index: 0,
            literal: "o.determiner",
          },
          {
            form: "hotel",
            gloss: "hotel",
            deprel: "nsubj",
            index: 1,
            literal: "hotel.noun",
          },
          {
            form: "fica",
            gloss: "is",
            deprel: "root",
            index: 2,
            literal: "ficar.verb.indicative.present.third.singular",
          },
          {
            form: "perto",
            gloss: "near",
            deprel: "advmod",
            index: 3,
            literal: "perto.adjective",
          },
          {
            form: "da",
            gloss: "of the",
            deprel: "case",
            index: 4,
            literal: "de.adposition",
          },
          {
            form: "praia",
            gloss: "beach",
            deprel: "obl",
            index: 5,
            literal: "praia.noun",
          },
        ],
      },
      RANKED: {
        rank: 49,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "socorro-chama-a-policia",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED"],
    trait: {
      TRANSLATED: {
        known: "Help! Call the police!",
        learning: "Socorro! Chama a polícia!",
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Socorro",
            gloss: "help!",
            deprel: "discourse",
            index: 0,
            literal: "socorro.noun",
          },
          {
            form: "Chama",
            gloss: "call",
            deprel: "root",
            index: 1,
            literal: "chamar.verb.imperative.third.singular",
          },
          {
            form: "a",
            gloss: "the",
            deprel: "det",
            index: 2,
            literal: "a.determiner",
          },
          {
            form: "polícia",
            gloss: "police",
            deprel: "obj",
            index: 3,
            literal: "polícia.noun",
          },
        ],
      },
      RANKED: {
        rank: 50,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.imperative",
      },
      {
        slug: "sentence.mood.imperative",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "esta-tudo-bem",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "It's all right.",
        learning: "Está tudo bem.",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/esta-tudo-bem.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Está",
            gloss: "be",
            deprel: "root",
            index: 0,
            literal: "estar.verb.indicative.present.third.singular",
          },
          {
            form: "tudo",
            gloss: "everything",
            deprel: "nsubj",
            index: 1,
            literal: "tudo.pronoun",
          },
          {
            form: "bem",
            gloss: "well",
            deprel: "advmod",
            index: 2,
            literal: "bem.adverb",
          },
        ],
      },
      RANKED: {
        rank: 527,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "sim-sim-claro",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "Yes, yes, of course.",
        learning: "Sim, sim, claro.",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/sim-sim-claro.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Sim",
            gloss: "yes",
            deprel: "advmod",
            index: 0,
            literal: "sim.adverb",
          },
          {
            form: "sim",
            gloss: "yes",
            deprel: "advmod",
            index: 1,
            literal: "sim.adverb",
          },
          {
            form: "claro",
            gloss: "of course",
            deprel: "root",
            index: 2,
            literal: "claro.adjective",
          },
        ],
      },
      RANKED: {
        rank: 528,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "esta-tudo-pronto",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "Everything is ready.",
        learning: "Está tudo pronto.",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/esta-tudo-pronto.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Está",
            gloss: "be",
            deprel: "root",
            index: 0,
            literal: "estar.verb.indicative.present.third.singular",
          },
          {
            form: "tudo",
            gloss: "everything",
            deprel: "nsubj",
            index: 1,
            literal: "tudo.pronoun",
          },
          {
            form: "pronto",
            gloss: "ready",
            deprel: "xcomp",
            index: 2,
            literal: "pronto.adjective",
          },
        ],
      },
      RANKED: {
        rank: 529,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "como-esta-se-sentindo",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "How are you feeling?",
        learning: "Como está se sentindo?",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/como-esta-se-sentindo.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Como",
            gloss: "how",
            deprel: "mark",
            index: 0,
            literal: "como.adverb",
          },
          {
            form: "está",
            gloss: "be",
            deprel: "aux",
            index: 1,
            literal: "estar.verb.indicative.present.third.singular",
          },
          {
            form: "se",
            gloss: "oneself",
            deprel: "obj",
            index: 2,
            literal: "se.pronoun",
          },
          {
            form: "sentindo",
            gloss: "feel",
            deprel: "root",
            index: 3,
            literal: "sentir.verb.gerund",
          },
        ],
      },
      RANKED: {
        rank: 530,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.interrogative",
      },
      {
        slug: "sentence.interrogative-type.content",
      },
      {
        slug: "sentence.wh-element.how",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "bem-vindo-ao-mundo-real",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "Welcome to the real world!",
        learning: "Bem-vindo ao mundo real!",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/bem-vindo-ao-mundo-real.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Bem-vindo",
            gloss: "welcome",
            deprel: "root",
            index: 0,
            literal: "bem-vindo.interjection",
          },
          {
            form: "a",
            gloss: "to",
            deprel: "case",
            index: 1,
            literal: "a.adposition",
          },
          {
            form: "o",
            gloss: "the",
            deprel: "det",
            index: 2,
            literal: "o.determiner",
          },
          {
            form: "mundo",
            gloss: "world",
            deprel: "nmod",
            index: 3,
            literal: "mundo.noun",
          },
          {
            form: "real",
            gloss: "real",
            deprel: "amod",
            index: 4,
            literal: "real.adjective",
          },
        ],
      },
      RANKED: {
        rank: 531,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.exclamative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "quero-agua",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "I want some water.",
        learning: "Quero água.",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/quero-agua.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Quero",
            gloss: "want",
            deprel: "root",
            index: 0,
            literal: "querer.verb.indicative.present.first.singular",
          },
          {
            form: "água",
            gloss: "water",
            deprel: "obj",
            index: 1,
            literal: "água.noun",
          },
        ],
      },
      RANKED: {
        rank: 532,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "eu-nao-quero-esperar-tanto",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "I don't want to wait that long.",
        learning: "Eu não quero esperar tanto.",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/eu-nao-quero-esperar-tanto.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Eu",
            gloss: "I",
            deprel: "nsubj",
            index: 0,
            literal: "eu.pronoun",
          },
          {
            form: "não",
            gloss: "not",
            deprel: "advmod",
            index: 1,
            literal: "não.adverb",
          },
          {
            form: "quero",
            gloss: "want",
            deprel: "root",
            index: 2,
            literal: "querer.verb.indicative.present.first.singular",
          },
          {
            form: "esperar",
            gloss: "wait",
            deprel: "xcomp",
            index: 3,
            literal: "esperar.verb.infinitive",
          },
          {
            form: "tanto",
            gloss: "so much",
            deprel: "advmod",
            index: 4,
            literal: "tanto.adverb",
          },
        ],
      },
      RANKED: {
        rank: 533,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.past",
      },
      {
        slug: "sentence.polarity.negative",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "estou-sem-vontade-de-comer",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "I don't want to eat.",
        learning: "Estou sem vontade de comer.",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/estou-sem-vontade-de-comer.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Estou",
            gloss: "be",
            deprel: "root",
            index: 0,
            literal: "estar.verb.indicative.present.first.singular",
          },
          {
            form: "sem",
            gloss: "without",
            deprel: "case",
            index: 1,
            literal: "sem.adposition",
          },
          {
            form: "vontade",
            gloss: "desire",
            deprel: "nmod",
            index: 2,
            literal: "vontade.noun",
          },
          {
            form: "de",
            gloss: "of",
            deprel: "mark",
            index: 3,
            literal: "de.adposition",
          },
          {
            form: "comer",
            gloss: "eat",
            deprel: "nmod",
            index: 4,
            literal: "comer.verb.infinitive",
          },
        ],
      },
      RANKED: {
        rank: 534,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "estou-com-fome-portanto-vou-pegar-algo-para-comer",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "I'm hungry, so I'm going to get something to eat.",
        learning: "Estou com fome, portanto vou pegar algo para comer.",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/estou-com-fome-portanto-vou-pegar-algo-para-comer.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Estou",
            gloss: "be",
            deprel: "root",
            index: 0,
            literal: "estar.verb.indicative.present.first.singular",
          },
          {
            form: "com",
            gloss: "with",
            deprel: "case",
            index: 1,
            literal: "com.adposition",
          },
          {
            form: "fome",
            gloss: "hunger",
            deprel: "nmod",
            index: 2,
            literal: "fome.noun",
          },
          {
            form: "portanto",
            gloss: "therefore",
            deprel: "advmod",
            index: 3,
            literal: "portanto.adverb",
          },
          {
            form: "vou",
            gloss: "go",
            deprel: "aux",
            index: 4,
            literal: "ir.verb.indicative.present.first.singular",
          },
          {
            form: "pegar",
            gloss: "get/grab",
            deprel: "conj",
            index: 5,
            literal: "pegar.verb.infinitive",
          },
          {
            form: "algo",
            gloss: "something",
            deprel: "obj",
            index: 6,
            literal: "algo.pronoun",
          },
          {
            form: "para",
            gloss: "for/to",
            deprel: "mark",
            index: 7,
            literal: "para.adposition",
          },
          {
            form: "comer",
            gloss: "eat",
            deprel: "advcl",
            index: 8,
            literal: "comer.verb.infinitive",
          },
        ],
      },
      RANKED: {
        rank: 535,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.imperative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "me-diz-a-verdade",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "Tell me the truth.",
        learning: "Me diz a verdade.",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/me-diz-a-verdade.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Me",
            gloss: "me",
            deprel: "iobj",
            index: 0,
            literal: "me.pronoun",
          },
          {
            form: "diz",
            gloss: "say",
            deprel: "root",
            index: 1,
            literal: "dizer.verb.indicative.present.third.singular",
          },
          {
            form: "a",
            gloss: "to",
            deprel: "det",
            index: 2,
            literal: "o.determiner",
          },
          {
            form: "verdade",
            gloss: "truth",
            deprel: "obj",
            index: 3,
            literal: "verdade.noun",
          },
        ],
      },
      RANKED: {
        rank: 536,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "deixe-me-experimentar",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "Let me have a taste.",
        learning: "Deixe-me experimentar.",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/deixe-me-experimentar.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Deixe",
            gloss: "let/leave",
            deprel: "root",
            index: 0,
            literal: "deixar.verb.imperative.present.third.singular",
          },
          {
            form: "me",
            gloss: "me",
            deprel: "obj",
            index: 1,
            literal: "me.pronoun",
          },
          {
            form: "experimentar",
            gloss: "try/taste",
            deprel: "xcomp",
            index: 2,
            literal: "experimentar.verb.infinitive",
          },
        ],
      },
      RANKED: {
        rank: 537,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "eu-nao-quero-que-ele-me-veja-assim",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "I don't want him to see me like this.",
        learning: "Eu não quero que ele me veja assim.",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/eu-nao-quero-que-ele-me-veja-assim.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Eu",
            gloss: "I",
            deprel: "nsubj",
            index: 0,
            literal: "eu.pronoun",
          },
          {
            form: "não",
            gloss: "not",
            deprel: "advmod",
            index: 1,
            literal: "não.adverb",
          },
          {
            form: "quero",
            gloss: "want",
            deprel: "root",
            index: 2,
            literal: "querer.verb.indicative.present.first.singular",
          },
          {
            form: "que",
            gloss: "that/what",
            deprel: "mark",
            index: 3,
            literal: "que.coordinating-conjunction",
          },
          {
            form: "ele",
            gloss: "he",
            deprel: "nsubj",
            index: 4,
            literal: "ele.pronoun",
          },
          {
            form: "me",
            gloss: "me",
            deprel: "obj",
            index: 5,
            literal: "me.pronoun",
          },
          {
            form: "veja",
            gloss: "see",
            deprel: "ccomp",
            index: 6,
            literal: "ver.verb.subjunctive.present.third.singular",
          },
          {
            form: "assim",
            gloss: "like this/thus",
            deprel: "advmod",
            index: 7,
            literal: "assim.adverb",
          },
        ],
      },
      RANKED: {
        rank: 538,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.subjunctive",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.negative",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "voce-entende",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "Do you understand?",
        learning: "Você entende?",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/voce-entende.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Você",
            gloss: "you",
            deprel: "nsubj",
            index: 0,
            literal: "você.pronoun",
          },
          {
            form: "entende",
            gloss: "understand",
            deprel: "root",
            index: 1,
            literal: "entender.verb.indicative.present.third.singular",
          },
        ],
      },
      RANKED: {
        rank: 539,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.interrogative",
      },
      {
        slug: "sentence.interrogative-type.polar",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.polite",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "voce-sabe-o-motivo",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "Do you know the reason?",
        learning: "Você sabe o motivo?",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/voce-sabe-o-motivo.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Você",
            gloss: "you",
            deprel: "nsubj",
            index: 0,
            literal: "você.pronoun",
          },
          {
            form: "sabe",
            gloss: "know",
            deprel: "root",
            index: 1,
            literal: "saber.verb.indicative.present.third.singular",
          },
          {
            form: "o",
            gloss: "the",
            deprel: "det",
            index: 2,
            literal: "o.determiner",
          },
          {
            form: "motivo",
            gloss: "reason",
            deprel: "obj",
            index: 3,
            literal: "motivo.noun",
          },
        ],
      },
      RANKED: {
        rank: 540,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.interrogative",
      },
      {
        slug: "sentence.interrogative-type.polar",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.polite",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "para-quem-voce-deu",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "Who did you give it to?",
        learning: "Para quem você deu?",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/para-quem-voce-deu.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Para",
            gloss: "for/to",
            deprel: "case",
            index: 0,
            literal: "para.adposition",
          },
          {
            form: "quem",
            gloss: "who",
            deprel: "nmod",
            index: 1,
            literal: "quem.pronoun",
          },
          {
            form: "você",
            gloss: "you",
            deprel: "nsubj",
            index: 2,
            literal: "você.pronoun",
          },
          {
            form: "deu",
            gloss: "give",
            deprel: "root",
            index: 3,
            literal: "dar.verb.indicative.past.third.singular",
          },
        ],
      },
      RANKED: {
        rank: 541,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.interrogative",
      },
      {
        slug: "sentence.interrogative-type.polar",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.past",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.polite",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "qual-e-o-seu-maior-medo",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "What's your greatest fear?",
        learning: "Qual é o seu maior medo?",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/qual-e-o-seu-maior-medo.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Qual",
            gloss: "which",
            deprel: "root",
            index: 0,
            literal: "qual.pronoun",
          },
          {
            form: "é",
            gloss: "be",
            deprel: "cop",
            index: 1,
            literal: "ser.verb.indicative.present.third.singular",
          },
          {
            form: "o",
            gloss: "the",
            deprel: "det",
            index: 2,
            literal: "o.determiner",
          },
          {
            form: "seu",
            gloss: "your/his",
            deprel: "det:poss",
            index: 3,
            literal: "seu.determiner",
          },
          {
            form: "maior",
            gloss: "bigger",
            deprel: "amod",
            index: 4,
            literal: "maior.adjective",
          },
          {
            form: "medo",
            gloss: "fear",
            deprel: "nsubj",
            index: 5,
            literal: "medo.noun",
          },
        ],
      },
      RANKED: {
        rank: 542,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.interrogative",
      },
      {
        slug: "sentence.interrogative-type.content",
      },
      {
        slug: "sentence.wh-element.which",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "e-entao-o-que-voce-fez",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "And then, what did you do?",
        learning: "E então, o que você fez?",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/e-entao-o-que-voce-fez.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "E",
            gloss: "and",
            deprel: "cc",
            index: 0,
            literal: "e.coordinating-conjunction",
          },
          {
            form: "então",
            gloss: "then",
            deprel: "advmod",
            index: 1,
            literal: "então.adverb",
          },
          {
            form: "o",
            gloss: "the",
            deprel: "root",
            index: 2,
            literal: "o.pronoun",
          },
          {
            form: "que",
            gloss: "that/what",
            deprel: "obj",
            index: 3,
            literal: "que.pronoun",
          },
          {
            form: "você",
            gloss: "you",
            deprel: "nsubj",
            index: 4,
            literal: "você.pronoun",
          },
          {
            form: "fez",
            gloss: "do/make",
            deprel: "acl:relcl",
            index: 5,
            literal: "fazer.verb.indicative.past.third.singular",
          },
        ],
      },
      RANKED: {
        rank: 543,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.interrogative",
      },
      {
        slug: "sentence.interrogative-type.polar",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.past",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.polite",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "como-ele-descobriu-isso",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "How did he discover that?",
        learning: "Como ele descobriu isso?",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/como-ele-descobriu-isso.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Como",
            gloss: "how",
            deprel: "mark",
            index: 0,
            literal: "como.adverb",
          },
          {
            form: "ele",
            gloss: "he",
            deprel: "nsubj",
            index: 1,
            literal: "ele.pronoun",
          },
          {
            form: "descobriu",
            gloss: "discover",
            deprel: "root",
            index: 2,
            literal: "descobrir.verb.indicative.past.third.singular",
          },
          {
            form: "isso",
            gloss: "this/that",
            deprel: "obj",
            index: 3,
            literal: "isso.pronoun",
          },
        ],
      },
      RANKED: {
        rank: 544,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.interrogative",
      },
      {
        slug: "sentence.interrogative-type.content",
      },
      {
        slug: "sentence.wh-element.how",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.past",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "voce-poderia-resolver-o-problema",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "Could you solve the problem?",
        learning: "Você poderia resolver o problema?",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/voce-poderia-resolver-o-problema.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Você",
            gloss: "you",
            deprel: "nsubj",
            index: 0,
            literal: "você.pronoun",
          },
          {
            form: "poderia",
            gloss: "can",
            deprel: "aux",
            index: 1,
            literal: "poder.verb.conditional.present.third.singular",
          },
          {
            form: "resolver",
            gloss: "solve",
            deprel: "root",
            index: 2,
            literal: "resolver.verb.infinitive",
          },
          {
            form: "o",
            gloss: "the",
            deprel: "det",
            index: 3,
            literal: "o.determiner",
          },
          {
            form: "problema",
            gloss: "problem",
            deprel: "obj",
            index: 4,
            literal: "problema.noun",
          },
        ],
      },
      RANKED: {
        rank: 545,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.interrogative",
      },
      {
        slug: "sentence.interrogative-type.polar",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.conditional",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.polite",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "nao-consigo-encontrar-o-hotel",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "I can't find the hotel.",
        learning: "Não consigo encontrar o hotel.",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/nao-consigo-encontrar-o-hotel.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Não",
            gloss: "not",
            deprel: "advmod",
            index: 0,
            literal: "não.adverb",
          },
          {
            form: "consigo",
            gloss: "manage/can",
            deprel: "root",
            index: 1,
            literal: "conseguir.verb.indicative.present.first.singular",
          },
          {
            form: "encontrar",
            gloss: "find/meet",
            deprel: "xcomp",
            index: 2,
            literal: "encontrar.verb.infinitive",
          },
          {
            form: "o",
            gloss: "the",
            deprel: "det",
            index: 3,
            literal: "o.determiner",
          },
          {
            form: "hotel",
            gloss: "hotel",
            deprel: "obj",
            index: 4,
            literal: "hotel.noun",
          },
        ],
      },
      RANKED: {
        rank: 546,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.negative",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "isso-pode-acontecer-com-qualquer-um",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "This could happen to anybody.",
        learning: "Isso pode acontecer com qualquer um.",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/isso-pode-acontecer-com-qualquer-um.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Isso",
            gloss: "this/that",
            deprel: "nsubj",
            index: 0,
            literal: "isso.pronoun",
          },
          {
            form: "pode",
            gloss: "can",
            deprel: "aux",
            index: 1,
            literal: "poder.verb.indicative.present.third.singular",
          },
          {
            form: "acontecer",
            gloss: "happen",
            deprel: "root",
            index: 2,
            literal: "acontecer.verb.infinitive",
          },
          {
            form: "com",
            gloss: "with",
            deprel: "case",
            index: 3,
            literal: "com.adposition",
          },
          {
            form: "qualquer",
            gloss: "any",
            deprel: "det",
            index: 4,
            literal: "qualquer.determiner",
          },
          {
            form: "um",
            gloss: "a/one",
            deprel: "nmod",
            index: 5,
            literal: "um.pronoun",
          },
        ],
      },
      RANKED: {
        rank: 547,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "nao-posso-andar-mais-nem-um-pouco",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "I cannot walk any farther.",
        learning: "Não posso andar mais nem um pouco.",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/nao-posso-andar-mais-nem-um-pouco.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Não",
            gloss: "not",
            deprel: "advmod",
            index: 0,
            literal: "não.adverb",
          },
          {
            form: "posso",
            gloss: "can",
            deprel: "aux",
            index: 1,
            literal: "poder.verb.indicative.present.first.singular",
          },
          {
            form: "andar",
            gloss: "walk",
            deprel: "root",
            index: 2,
            literal: "andar.verb.infinitive",
          },
          {
            form: "mais",
            gloss: "more",
            deprel: "advmod",
            index: 3,
            literal: "mais.adverb",
          },
          {
            form: "nem",
            gloss: "not even",
            deprel: "advmod",
            index: 4,
            literal: "nem.adverb",
          },
          {
            form: "um",
            gloss: "a/one",
            deprel: "det",
            index: 5,
            literal: "um.determiner",
          },
          {
            form: "pouco",
            gloss: "little",
            deprel: "nmod",
            index: 6,
            literal: "pouco.noun",
          },
        ],
      },
      RANKED: {
        rank: 548,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.negative",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "esta-caixa-e-muito-pesada-entao-nao-posso-carrega-la",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "This box is very heavy, so I can't carry it.",
        learning: "Esta caixa é muito pesada, então não posso carregá-la.",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/esta-caixa-e-muito-pesada-entao-nao-posso-carrega-la.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Esta",
            gloss: "this",
            deprel: "det",
            index: 0,
            literal: "este.determiner",
          },
          {
            form: "caixa",
            gloss: "box",
            deprel: "nsubj",
            index: 1,
            literal: "caixa.noun",
          },
          {
            form: "é",
            gloss: "be",
            deprel: "root",
            index: 2,
            literal: "ser.verb.indicative.present.third.singular",
          },
          {
            form: "muito",
            gloss: "very/much",
            deprel: "advmod",
            index: 3,
            literal: "muito.adverb",
          },
          {
            form: "pesada",
            gloss: "heavy",
            deprel: "xcomp",
            index: 4,
            literal: "pesado.adjective",
          },
          {
            form: "então",
            gloss: "then",
            deprel: "advmod",
            index: 5,
            literal: "então.adverb",
          },
          {
            form: "não",
            gloss: "not",
            deprel: "advmod",
            index: 6,
            literal: "não.adverb",
          },
          {
            form: "posso",
            gloss: "can",
            deprel: "aux",
            index: 7,
            literal: "poder.verb.indicative.present.first.singular",
          },
          {
            form: "carregá",
            gloss: "carry",
            deprel: "conj",
            index: 8,
            literal: "carregar.verb.indicative.present.third.singular",
          },
          {
            form: "la",
            gloss: "her/it",
            deprel: "obj",
            index: 9,
            literal: "ela.pronoun",
          },
        ],
      },
      RANKED: {
        rank: 549,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.negative",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "faca-o-seu-melhor",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "Do your best.",
        learning: "Faça o seu melhor!",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/faca-o-seu-melhor.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Faça",
            gloss: "do/make",
            deprel: "root",
            index: 0,
            literal: "fazer.verb.imperative.present.third.singular",
          },
          {
            form: "o",
            gloss: "the",
            deprel: "det",
            index: 1,
            literal: "o.determiner",
          },
          {
            form: "seu",
            gloss: "your/his",
            deprel: "det:poss",
            index: 2,
            literal: "seu.determiner",
          },
          {
            form: "melhor",
            gloss: "best/better",
            deprel: "obj",
            index: 3,
            literal: "melhor.noun",
          },
        ],
      },
      RANKED: {
        rank: 550,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.exclamative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.imperative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "feche-os-olhos",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "Close your eyes.",
        learning: "Feche os olhos.",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/feche-os-olhos.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Feche",
            gloss: "close",
            deprel: "root",
            index: 0,
            literal: "fechar.verb.imperative.present.third.singular",
          },
          {
            form: "os",
            gloss: "the",
            deprel: "det",
            index: 1,
            literal: "o.determiner",
          },
          {
            form: "olhos",
            gloss: "eyes",
            deprel: "obj",
            index: 2,
            literal: "olho.noun",
          },
        ],
      },
      RANKED: {
        rank: 551,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.imperative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "tente-se-lembrar",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "Try to remember.",
        learning: "Tente se lembrar.",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/tente-se-lembrar.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Tente",
            gloss: "tente",
            deprel: "root",
            index: 0,
            literal: "tentar.verb.imperative.present.third.singular",
          },
          {
            form: "se",
            gloss: "oneself",
            deprel: "obj",
            index: 1,
            literal: "se.pronoun",
          },
          {
            form: "lembrar",
            gloss: "remember",
            deprel: "xcomp",
            index: 2,
            literal: "lembrar.verb.infinitive",
          },
        ],
      },
      RANKED: {
        rank: 552,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.imperative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "limpa-essa-bagunca",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "Clean up this mess.",
        learning: "Limpa essa bagunça.",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/limpa-essa-bagunca.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Limpa",
            gloss: "limpa",
            deprel: "root",
            index: 0,
            literal: "limpar.verb.imperative.present.second.singular",
          },
          {
            form: "essa",
            gloss: "that",
            deprel: "det",
            index: 1,
            literal: "esse.determiner",
          },
          {
            form: "bagunça",
            gloss: "mess",
            deprel: "obj",
            index: 2,
            literal: "bagunça.noun",
          },
        ],
      },
      RANKED: {
        rank: 553,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.imperative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "para-de-mimimi",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "Quit whining.",
        learning: "Para de mimimi.",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/para-de-mimimi.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Para",
            gloss: "for/to",
            deprel: "case",
            index: 0,
            literal: "para.adposition",
          },
          {
            form: "de",
            gloss: "of",
            deprel: "case",
            index: 1,
            literal: "de.adposition",
          },
          {
            form: "mimimi",
            gloss: "whining",
            deprel: "root",
            index: 2,
            literal: "mimimi.noun",
          },
        ],
      },
      RANKED: {
        rank: 554,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.imperative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "nao-estou-me-envolvendo",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "I am not getting involved.",
        learning: "Não estou me envolvendo.",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/nao-estou-me-envolvendo.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Não",
            gloss: "not",
            deprel: "advmod",
            index: 0,
            literal: "não.adverb",
          },
          {
            form: "estou",
            gloss: "be",
            deprel: "aux",
            index: 1,
            literal: "estar.verb.indicative.present.first.singular",
          },
          {
            form: "me",
            gloss: "me",
            deprel: "obj",
            index: 2,
            literal: "me.pronoun",
          },
          {
            form: "envolvendo",
            gloss: "involve",
            deprel: "root",
            index: 3,
            literal: "envolver.verb.gerund",
          },
        ],
      },
      RANKED: {
        rank: 555,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.negative",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "nao-quero-ser-envolvido-nesse-negocio",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "I don't want to be involved in this affair.",
        learning: "Não quero ser envolvido nesse negócio.",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/nao-quero-ser-envolvido-nesse-negocio.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Não",
            gloss: "not",
            deprel: "advmod",
            index: 0,
            literal: "não.adverb",
          },
          {
            form: "quero",
            gloss: "want",
            deprel: "root",
            index: 1,
            literal: "querer.verb.indicative.present.first.singular",
          },
          {
            form: "ser",
            gloss: "be",
            deprel: "aux:pass",
            index: 2,
            literal: "ser.verb.infinitive",
          },
          {
            form: "envolvido",
            gloss: "involve",
            deprel: "xcomp",
            index: 3,
            literal: "envolver.verb.participle.past",
          },
          {
            form: "nesse",
            gloss: "in this",
            deprel: "case",
            index: 4,
            literal: "em.adposition",
          },
          {
            form: "negócio",
            gloss: "business/affair",
            deprel: "nmod",
            index: 5,
            literal: "negócio.noun",
          },
        ],
      },
      RANKED: {
        rank: 556,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.negative",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "nao-me-subestime",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "Don't underestimate me.",
        learning: "Não me subestime.",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/nao-me-subestime.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Não",
            gloss: "not",
            deprel: "advmod",
            index: 0,
            literal: "não.adverb",
          },
          {
            form: "me",
            gloss: "me",
            deprel: "obj",
            index: 1,
            literal: "me.pronoun",
          },
          {
            form: "subestime",
            gloss: "underestimate",
            deprel: "root",
            index: 2,
            literal: "subestimar.verb.imperative.present.third.singular",
          },
        ],
      },
      RANKED: {
        rank: 557,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.negative",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "que-tal-amanha",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "How about tomorrow?",
        learning: "Que tal amanhã?",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/que-tal-amanha.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Que",
            gloss: "that/what",
            deprel: "det",
            index: 0,
            literal: "que.pronoun",
          },
          {
            form: "tal",
            gloss: "such",
            deprel: "root",
            index: 1,
            literal: "tal.pronoun",
          },
          {
            form: "amanhã",
            gloss: "tomorrow",
            deprel: "advmod",
            index: 2,
            literal: "amanhã.adverb",
          },
        ],
      },
      RANKED: {
        rank: 558,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.interrogative",
      },
      {
        slug: "sentence.interrogative-type.content",
      },
      {
        slug: "sentence.wh-element.what",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "era-hora-de-partir",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "It was time to leave.",
        learning: "Era hora de partir.",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/era-hora-de-partir.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Era",
            gloss: "was",
            deprel: "cop",
            index: 0,
            literal: "ser.verb.indicative.past.third.singular",
          },
          {
            form: "hora",
            gloss: "hour/time",
            deprel: "root",
            index: 1,
            literal: "hora.noun",
          },
          {
            form: "de",
            gloss: "of",
            deprel: "mark",
            index: 2,
            literal: "de.adposition",
          },
          {
            form: "partir",
            gloss: "leave",
            deprel: "nmod",
            index: 3,
            literal: "partir.verb.infinitive",
          },
        ],
      },
      RANKED: {
        rank: 559,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.past",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "hoje-e-um-dia-muito-especial",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "This is a very special day.",
        learning: "Hoje é um dia muito especial.",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/hoje-e-um-dia-muito-especial.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Hoje",
            gloss: "today",
            deprel: "advmod",
            index: 0,
            literal: "hoje.adverb",
          },
          {
            form: "é",
            gloss: "be",
            deprel: "cop",
            index: 1,
            literal: "ser.verb.indicative.present.third.singular",
          },
          {
            form: "um",
            gloss: "a/one",
            deprel: "det",
            index: 2,
            literal: "um.determiner",
          },
          {
            form: "dia",
            gloss: "day",
            deprel: "root",
            index: 3,
            literal: "dia.noun",
          },
          {
            form: "muito",
            gloss: "very/much",
            deprel: "advmod",
            index: 4,
            literal: "muito.adverb",
          },
          {
            form: "especial",
            gloss: "special",
            deprel: "amod",
            index: 5,
            literal: "especial.adjective",
          },
        ],
      },
      RANKED: {
        rank: 560,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "ha-diversos-tipos-de-cafe",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "There are various kinds of coffee.",
        learning: "Há diversos tipos de café.",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/ha-diversos-tipos-de-cafe.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Há",
            gloss: "there is",
            deprel: "root",
            index: 0,
            literal: "haver.verb.indicative.present.third.singular",
          },
          {
            form: "diversos",
            gloss: "various",
            deprel: "det",
            index: 1,
            literal: "diverso.determiner",
          },
          {
            form: "tipos",
            gloss: "types",
            deprel: "obj",
            index: 2,
            literal: "tipo.noun",
          },
          {
            form: "de",
            gloss: "of",
            deprel: "case",
            index: 3,
            literal: "de.adposition",
          },
          {
            form: "café",
            gloss: "coffee",
            deprel: "nmod",
            index: 4,
            literal: "café.noun",
          },
        ],
      },
      RANKED: {
        rank: 561,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "se-voce-comer-muito-vai-engordar",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "If you eat too much, you will get fat.",
        learning: "Se você comer muito, vai engordar.",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/se-voce-comer-muito-vai-engordar.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Se",
            gloss: "oneself",
            deprel: "mark",
            index: 0,
            literal: "se.subordinating-conjunction",
          },
          {
            form: "você",
            gloss: "you",
            deprel: "nsubj",
            index: 1,
            literal: "você.pronoun",
          },
          {
            form: "comer",
            gloss: "eat",
            deprel: "advcl",
            index: 2,
            literal: "comer.verb.infinitive",
          },
          {
            form: "muito",
            gloss: "very/much",
            deprel: "advmod",
            index: 3,
            literal: "muito.adverb",
          },
          {
            form: "vai",
            gloss: "go",
            deprel: "aux",
            index: 4,
            literal: "ir.verb.indicative.present.third.singular",
          },
          {
            form: "engordar",
            gloss: "get fat",
            deprel: "root",
            index: 5,
            literal: "engordar.verb.infinitive",
          },
        ],
      },
      RANKED: {
        rank: 562,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.polite",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "esta-e-a-rua-principal-desta-cidade",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "This is the main street of this city.",
        learning: "Esta é a rua principal desta cidade.",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/esta-e-a-rua-principal-desta-cidade.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Esta",
            gloss: "this",
            deprel: "nsubj",
            index: 0,
            literal: "este.pronoun",
          },
          {
            form: "é",
            gloss: "be",
            deprel: "cop",
            index: 1,
            literal: "ser.verb.indicative.present.third.singular",
          },
          {
            form: "a",
            gloss: "to",
            deprel: "det",
            index: 2,
            literal: "o.determiner",
          },
          {
            form: "rua",
            gloss: "street",
            deprel: "root",
            index: 3,
            literal: "rua.noun",
          },
          {
            form: "principal",
            gloss: "main",
            deprel: "amod",
            index: 4,
            literal: "principal.adjective",
          },
          {
            form: "desta",
            gloss: "of this",
            deprel: "case",
            index: 5,
            literal: "de.adposition",
          },
          {
            form: "cidade",
            gloss: "city",
            deprel: "nmod",
            index: 6,
            literal: "cidade.noun",
          },
        ],
      },
      RANKED: {
        rank: 563,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "eu-vou-para-o-brasil-de-aviao",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "I go to Brazil by airplane.",
        learning: "Eu vou para o Brasil de avião.",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/eu-vou-para-o-brasil-de-aviao.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Eu",
            gloss: "I",
            deprel: "nsubj",
            index: 0,
            literal: "eu.pronoun",
          },
          {
            form: "vou",
            gloss: "go",
            deprel: "root",
            index: 1,
            literal: "ir.verb.indicative.present.first.singular",
          },
          {
            form: "para",
            gloss: "for/to",
            deprel: "case",
            index: 2,
            literal: "para.adposition",
          },
          {
            form: "o",
            gloss: "the",
            deprel: "det",
            index: 3,
            literal: "o.determiner",
          },
          {
            form: "Brasil",
            gloss: "brasil",
            deprel: "nmod",
            index: 4,
            literal: "Brasil.proper-noun",
          },
          {
            form: "de",
            gloss: "of",
            deprel: "case",
            index: 5,
            literal: "de.adposition",
          },
          {
            form: "avião",
            gloss: "airplane",
            deprel: "nmod",
            index: 6,
            literal: "avião.noun",
          },
        ],
      },
      RANKED: {
        rank: 564,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.imperative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "estamos-presos-no-transito",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "We're stuck in traffic.",
        learning: "Estamos presos no trânsito.",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/estamos-presos-no-transito.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Estamos",
            gloss: "be",
            deprel: "root",
            index: 0,
            literal: "estar.verb.indicative.present.first.plural",
          },
          {
            form: "presos",
            gloss: "stuck",
            deprel: "xcomp",
            index: 1,
            literal: "preso.adjective",
          },
          {
            form: "em",
            gloss: "in",
            deprel: "case",
            index: 2,
            literal: "em.adposition",
          },
          {
            form: "o",
            gloss: "the",
            deprel: "det",
            index: 3,
            literal: "o.determiner",
          },
          {
            form: "trânsito",
            gloss: "traffic",
            deprel: "nmod",
            index: 4,
            literal: "trânsito.noun",
          },
        ],
      },
      RANKED: {
        rank: 565,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "todos-cometem-erros",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "Everyone makes mistakes.",
        learning: "Todos cometem erros.",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/todos-cometem-erros.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Todos",
            gloss: "everyone/all",
            deprel: "nsubj",
            index: 0,
            literal: "todo.pronoun",
          },
          {
            form: "cometem",
            gloss: "commit",
            deprel: "root",
            index: 1,
            literal: "cometer.verb.indicative.present.third.plural",
          },
          {
            form: "erros",
            gloss: "error/mistake",
            deprel: "obj",
            index: 2,
            literal: "erro.noun",
          },
        ],
      },
      RANKED: {
        rank: 566,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "estou-pronto-para-partir",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "I'm ready to leave.",
        learning: "Estou pronto para partir.",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/estou-pronto-para-partir.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Estou",
            gloss: "be",
            deprel: "root",
            index: 0,
            literal: "estar.verb.indicative.present.first.singular",
          },
          {
            form: "pronto",
            gloss: "ready",
            deprel: "xcomp",
            index: 1,
            literal: "pronto.adjective",
          },
          {
            form: "para",
            gloss: "for/to",
            deprel: "mark",
            index: 2,
            literal: "para.adposition",
          },
          {
            form: "partir",
            gloss: "leave",
            deprel: "nmod",
            index: 3,
            literal: "partir.verb.infinitive",
          },
        ],
      },
      RANKED: {
        rank: 567,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.imperative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "ela-me-apresentou-ao-irmao-dela",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "She introduced me to her brother.",
        learning: "Ela me apresentou ao irmão dela.",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/ela-me-apresentou-ao-irmao-dela.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Ela",
            gloss: "she",
            deprel: "nsubj",
            index: 0,
            literal: "ela.pronoun",
          },
          {
            form: "me",
            gloss: "me",
            deprel: "obj",
            index: 1,
            literal: "me.pronoun",
          },
          {
            form: "apresentou",
            gloss: "introduce",
            deprel: "root",
            index: 2,
            literal: "apresentar.verb.indicative.past.third.singular",
          },
          {
            form: "a",
            gloss: "to",
            deprel: "case",
            index: 3,
            literal: "a.adposition",
          },
          {
            form: "o",
            gloss: "the",
            deprel: "det",
            index: 4,
            literal: "o.determiner",
          },
          {
            form: "irmão",
            gloss: "brother",
            deprel: "obl",
            index: 5,
            literal: "irmão.noun",
          },
          {
            form: "de",
            gloss: "of",
            deprel: "case",
            index: 6,
            literal: "de.adposition",
          },
          {
            form: "ela",
            gloss: "she",
            deprel: "nmod",
            index: 7,
            literal: "ela.pronoun",
          },
        ],
      },
      RANKED: {
        rank: 568,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.past",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "eu-o-encontrei-em-janeiro",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "I met him in January.",
        learning: "Eu o encontrei em janeiro.",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/eu-o-encontrei-em-janeiro.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Eu",
            gloss: "I",
            deprel: "nsubj",
            index: 0,
            literal: "eu.pronoun",
          },
          {
            form: "o",
            gloss: "the",
            deprel: "obj",
            index: 1,
            literal: "o.pronoun",
          },
          {
            form: "encontrei",
            gloss: "find/meet",
            deprel: "root",
            index: 2,
            literal: "encontrar.verb.indicative.past.first.singular",
          },
          {
            form: "em",
            gloss: "in",
            deprel: "case",
            index: 3,
            literal: "em.adposition",
          },
          {
            form: "janeiro",
            gloss: "January",
            deprel: "nmod",
            index: 4,
            literal: "janeiro.proper-noun",
          },
        ],
      },
      RANKED: {
        rank: 569,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.past",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "tom-comprou-um-carro-maior",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "Tom bought a larger car.",
        learning: "Tom comprou um carro maior.",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/tom-comprou-um-carro-maior.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Tom",
            gloss: "Tom",
            deprel: "nsubj",
            index: 0,
            literal: "Tom.proper-noun",
          },
          {
            form: "comprou",
            gloss: "buy",
            deprel: "root",
            index: 1,
            literal: "comprar.verb.indicative.past.third.singular",
          },
          {
            form: "um",
            gloss: "a/one",
            deprel: "det",
            index: 2,
            literal: "um.determiner",
          },
          {
            form: "carro",
            gloss: "car",
            deprel: "obj",
            index: 3,
            literal: "carro.noun",
          },
          {
            form: "maior",
            gloss: "bigger",
            deprel: "amod",
            index: 4,
            literal: "maior.adjective",
          },
        ],
      },
      RANKED: {
        rank: 570,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.past",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "foi-assim-que-conheci-sua-mae",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "This is how I met your mother.",
        learning: "Foi assim que conheci sua mãe.",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/foi-assim-que-conheci-sua-mae.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Foi",
            gloss: "was/went",
            deprel: "root",
            index: 0,
            literal: "ser.verb.indicative.past.third.singular",
          },
          {
            form: "assim",
            gloss: "like this/thus",
            deprel: "advmod",
            index: 1,
            literal: "assim.adverb",
          },
          {
            form: "que",
            gloss: "that/what",
            deprel: "mark",
            index: 2,
            literal: "que.coordinating-conjunction",
          },
          {
            form: "conheci",
            gloss: "know/meet",
            deprel: "csubj",
            index: 3,
            literal: "conhecer.verb.indicative.past.first.singular",
          },
          {
            form: "sua",
            gloss: "your/her",
            deprel: "det:poss",
            index: 4,
            literal: "sua.determiner",
          },
          {
            form: "mãe",
            gloss: "mother",
            deprel: "obj",
            index: 5,
            literal: "mãe.noun",
          },
        ],
      },
      RANKED: {
        rank: 571,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.past",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "por-favor-voce-poderia-falar-um-pouco-mais-devagar",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "Could you please speak a little bit more slowly?",
        learning: "Por favor, você poderia falar um pouco mais devagar?",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/por-favor-voce-poderia-falar-um-pouco-mais-devagar.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Por",
            gloss: "by/for",
            deprel: "case",
            index: 0,
            literal: "por.adposition",
          },
          {
            form: "favor",
            gloss: "favor",
            deprel: "nmod",
            index: 1,
            literal: "favor.noun",
          },
          {
            form: "você",
            gloss: "you",
            deprel: "nsubj",
            index: 2,
            literal: "você.pronoun",
          },
          {
            form: "poderia",
            gloss: "can",
            deprel: "aux",
            index: 3,
            literal: "poder.verb.conditional.present.third.singular",
          },
          {
            form: "falar",
            gloss: "speak",
            deprel: "root",
            index: 4,
            literal: "falar.verb.infinitive",
          },
          {
            form: "um",
            gloss: "a/one",
            deprel: "det",
            index: 5,
            literal: "um.determiner",
          },
          {
            form: "pouco",
            gloss: "little",
            deprel: "nmod",
            index: 6,
            literal: "pouco.noun",
          },
          {
            form: "mais",
            gloss: "more",
            deprel: "advmod",
            index: 7,
            literal: "mais.adverb",
          },
          {
            form: "devagar",
            gloss: "slowly",
            deprel: "advmod",
            index: 8,
            literal: "devagar.adverb",
          },
        ],
      },
      RANKED: {
        rank: 572,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.interrogative",
      },
      {
        slug: "sentence.interrogative-type.polar",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.conditional",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.polite",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "voce-sabe-falar-frances-tambem",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "Can you speak French, too?",
        learning: "Você sabe falar francês também?",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/voce-sabe-falar-frances-tambem.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Você",
            gloss: "you",
            deprel: "nsubj",
            index: 0,
            literal: "você.pronoun",
          },
          {
            form: "sabe",
            gloss: "know",
            deprel: "root",
            index: 1,
            literal: "saber.verb.indicative.present.third.singular",
          },
          {
            form: "falar",
            gloss: "speak",
            deprel: "xcomp",
            index: 2,
            literal: "falar.verb.infinitive",
          },
          {
            form: "francês",
            gloss: "French",
            deprel: "obj",
            index: 3,
            literal: "francês.noun",
          },
          {
            form: "também",
            gloss: "also/too",
            deprel: "advmod",
            index: 4,
            literal: "também.adverb",
          },
        ],
      },
      RANKED: {
        rank: 573,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.interrogative",
      },
      {
        slug: "sentence.interrogative-type.polar",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.polite",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "nao-importa-quao-faminto-voce-esta-voce-deve-comer-devagar",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "However hungry you are, you must eat slowly.",
        learning: "Não importa quão faminto você está, você deve comer devagar.",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/nao-importa-quao-faminto-voce-esta-voce-deve-comer-devagar.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Não",
            gloss: "not",
            deprel: "advmod",
            index: 0,
            literal: "não.adverb",
          },
          {
            form: "importa",
            gloss: "matter",
            deprel: "root",
            index: 1,
            literal: "importar.verb.indicative.present.third.singular",
          },
          {
            form: "quão",
            gloss: "how (much)",
            deprel: "advmod",
            index: 2,
            literal: "quão.adverb",
          },
          {
            form: "faminto",
            gloss: "hungry",
            deprel: "xcomp",
            index: 3,
            literal: "faminto.adjective",
          },
          {
            form: "você",
            gloss: "you",
            deprel: "nsubj",
            index: 4,
            literal: "você.pronoun",
          },
          {
            form: "está",
            gloss: "be",
            deprel: "ccomp",
            index: 5,
            literal: "estar.verb.indicative.present.third.singular",
          },
          {
            form: "você",
            gloss: "you",
            deprel: "nsubj",
            index: 6,
            literal: "você.pronoun",
          },
          {
            form: "deve",
            gloss: "should/must",
            deprel: "aux",
            index: 7,
            literal: "dever.verb.indicative.present.third.singular",
          },
          {
            form: "comer",
            gloss: "eat",
            deprel: "parataxis",
            index: 8,
            literal: "comer.verb.infinitive",
          },
          {
            form: "devagar",
            gloss: "slowly",
            deprel: "advmod",
            index: 9,
            literal: "devagar.adverb",
          },
        ],
      },
      RANKED: {
        rank: 574,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.negative",
      },
      {
        slug: "sentence.politeness.polite",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "ele-perdeu-o-relogio-que-havia-comprado-no-dia-anterior",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "He lost the watch which he had bought the day before.",
        learning: "Ele perdeu o relógio que havia comprado no dia anterior.",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/ele-perdeu-o-relogio-que-havia-comprado-no-dia-anterior.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Ele",
            gloss: "he",
            deprel: "nsubj",
            index: 0,
            literal: "ele.pronoun",
          },
          {
            form: "perdeu",
            gloss: "lose",
            deprel: "root",
            index: 1,
            literal: "perder.verb.indicative.past.third.singular",
          },
          {
            form: "o",
            gloss: "the",
            deprel: "det",
            index: 2,
            literal: "o.determiner",
          },
          {
            form: "relógio",
            gloss: "watch/clock",
            deprel: "obj",
            index: 3,
            literal: "relógio.noun",
          },
          {
            form: "que",
            gloss: "that/what",
            deprel: "nsubj",
            index: 4,
            literal: "que.pronoun",
          },
          {
            form: "havia",
            gloss: "there is",
            deprel: "aux",
            index: 5,
            literal: "haver.verb.indicative.past.third.singular",
          },
          {
            form: "comprado",
            gloss: "buy",
            deprel: "acl:relcl",
            index: 6,
            literal: "comprar.verb.participle.past",
          },
          {
            form: "em",
            gloss: "in",
            deprel: "case",
            index: 7,
            literal: "em.adposition",
          },
          {
            form: "o",
            gloss: "the",
            deprel: "det",
            index: 8,
            literal: "o.determiner",
          },
          {
            form: "dia",
            gloss: "day",
            deprel: "nmod",
            index: 9,
            literal: "dia.noun",
          },
          {
            form: "anterior",
            gloss: "previous",
            deprel: "amod",
            index: 10,
            literal: "anterior.adjective",
          },
        ],
      },
      RANKED: {
        rank: 575,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.indicative",
      },
      {
        slug: "sentence.tense.past",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
  {
    slug: "embora-ele-tenha-se-desculpado-eu-ainda-estou-furioso",
    traits: ["TRANSLATED", "ANNOTATED", "RANKED", "VOCALIZED"],
    trait: {
      TRANSLATED: {
        known: "Even though he apologized, I'm still furious.",
        learning: "Embora ele tenha se desculpado, eu ainda estou furioso.",
      },
      VOCALIZED: {
        asset: {
          path: "sentences/embora-ele-tenha-se-desculpado-eu-ainda-estou-furioso.mp3",
        },
      },
      ANNOTATED: {
        tokens: [
          {
            form: "Embora",
            gloss: "although",
            deprel: "mark",
            index: 0,
            literal: "embora.subordinating-conjunction",
          },
          {
            form: "ele",
            gloss: "he",
            deprel: "nsubj",
            index: 1,
            literal: "ele.pronoun",
          },
          {
            form: "tenha",
            gloss: "have",
            deprel: "aux",
            index: 2,
            literal: "ter.verb.subjunctive.present.third.singular",
          },
          {
            form: "se",
            gloss: "oneself",
            deprel: "obj",
            index: 3,
            literal: "se.pronoun",
          },
          {
            form: "desculpado",
            gloss: "apologize",
            deprel: "advcl",
            index: 4,
            literal: "desculpar.verb.participle.past",
          },
          {
            form: "eu",
            gloss: "I",
            deprel: "nsubj",
            index: 5,
            literal: "eu.pronoun",
          },
          {
            form: "ainda",
            gloss: "still",
            deprel: "advmod",
            index: 6,
            literal: "ainda.adverb",
          },
          {
            form: "estou",
            gloss: "be",
            deprel: "root",
            index: 7,
            literal: "estar.verb.indicative.present.first.singular",
          },
          {
            form: "furioso",
            gloss: "furious",
            deprel: "xcomp",
            index: 8,
            literal: "furioso.adjective",
          },
        ],
      },
      RANKED: {
        rank: 576,
      },
    },
    symbols: [
      {
        slug: "sentence",
      },
      {
        slug: "sentence.force.declarative",
      },
      {
        slug: "sentence.finiteness.finite",
      },
      {
        slug: "sentence.mood.subjunctive",
      },
      {
        slug: "sentence.tense.present",
      },
      {
        slug: "sentence.polarity.positive",
      },
      {
        slug: "sentence.politeness.informal",
      },
      {
        slug: "proficiency.cefr.a1",
      },
      {
        slug: "proficiency.survival",
      },
    ],
  },
];
