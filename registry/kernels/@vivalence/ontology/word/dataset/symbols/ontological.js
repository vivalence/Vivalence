export default [
  {
    slug: "word",
    traits: ["ONTOLOGICAL", "LABELED", "TOPOGRAPHICAL"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Word", description: "A word" },
      TOPOGRAPHICAL: {},
    },
  },
  {
    slug: "word.part-of-speech.adjective",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Adjective", description: "A word that modifies a noun or pronoun." },
    },
  },
  {
    slug: "word.part-of-speech.adposition",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Adposition",
        description: "A word that shows the relationship between its object and another word.",
      },
    },
  },
  {
    slug: "word.part-of-speech.adverb",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Adverb",
        description: "A word that modifies a verb, an adjective, or another adverb.",
      },
    },
  },
  {
    slug: "word.part-of-speech.auxiliary",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Auxiliary Verb",
        description: "A verb used in forming tenses, moods, and voices.",
      },
    },
  },
  {
    slug: "word.part-of-speech.coordinating-conjunction",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Coordinating Conjunction",
        description: "A word that connects words, phrases, or clauses of equal rank.",
      },
    },
  },
  {
    slug: "word.part-of-speech.determiner",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Determiner", description: "A word that introduces a noun." },
    },
  },
  {
    slug: "word.part-of-speech.interjection",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Interjection",
        description: "A word or phrase that expresses strong emotion or surprise.",
      },
    },
  },
  {
    slug: "word.part-of-speech.noun",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Noun",
        description: "A word that refers to a person, place, thing, or idea.",
      },
    },
  },
  {
    slug: "word.part-of-speech.numeral",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Numeral", description: "A word that expresses a number." },
    },
  },
  {
    slug: "word.part-of-speech.particle",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Particle",
        description:
          "A word that has grammatical function but does not fit into the main parts of speech.",
      },
    },
  },
  {
    slug: "word.part-of-speech.pronoun",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Pronoun", description: "A word that takes the place of a noun." },
    },
  },
  {
    slug: "word.part-of-speech.proper-noun",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Proper Noun",
        description: "A noun that denotes a particular person, place, or thing.",
      },
    },
  },
  {
    slug: "word.part-of-speech.punctuation",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Punctuation",
        description: "A symbol that indicates the structure and organization of writing.",
      },
    },
  },
  {
    slug: "word.part-of-speech.subordinating-conjunction",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Subordinating Conjunction",
        description: "A conjunction that introduces a subordinate clause.",
      },
    },
  },
  {
    slug: "word.part-of-speech.verb",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Verb",
        description: "A word that expresses an action or a state of being.",
      },
    },
  },
  {
    slug: "word.verb-form.finite",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Finite", description: "A verb form that is limited by subject and tense." },
    },
  },
  {
    slug: "word.verb-form.infinitive",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {
        // dimension: "word.verb-form.infinitive",
      },
      LABELED: {
        name: "Infinitive",
        description: "The base form of a verb, usually preceded by 'to'.",
      },
    },
  },
  {
    slug: "word.verb-form.participle",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Participle",
        description: "A form of a verb used as an adjective or to form compound tenses.",
      },
    },
  },
  {
    slug: "word.verb-form.gerund",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Gerund", description: "A verb form that functions as a noun." },
    },
  },
  {
    slug: "word.verb-form.supine",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Supine",
        description: "A verbal noun form expressing purpose or goal of motion.",
      },
    },
  },
  {
    slug: "word.tense.past",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Past", description: "An action or state that occurred in the past." },
    },
  },
  {
    slug: "word.tense.present",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Present", description: "An action or state that is currently occurring." },
    },
  },
  {
    slug: "word.tense.future",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Future", description: "An action or state that will occur in the future." },
    },
  },
  {
    slug: "word.tense.imperfect",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Imperfect",
        description: "A past action or state that was ongoing or repeated.",
      },
    },
  },
  {
    slug: "word.tense.pluperfect",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Pluperfect",
        description: "An action or state completed before another past action.",
      },
    },
  },
  {
    slug: "word.mood.indicative",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Indicative", description: "A mood used for statements of fact." },
    },
  },
  {
    slug: "word.mood.subjunctive",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Subjunctive",
        description: "A mood used for hypothetical or non-real actions.",
      },
    },
  },
  {
    slug: "word.mood.imperative",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Imperative", description: "A mood used for commands or requests." },
    },
  },
  {
    slug: "word.mood.conditional",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Conditional",
        description: "A mood used to express conditions or hypothetical situations.",
      },
    },
  },
  {
    slug: "word.person.first",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "First Person", description: "The speaker or writer." },
    },
  },
  {
    slug: "word.person.second",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Second Person", description: "The person being addressed." },
    },
  },
  {
    slug: "word.person.third",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Third Person", description: "The person or thing being talked about." },
    },
  },
  {
    slug: "word.number.singular",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Singular", description: "One person, place, thing, or idea." },
    },
  },
  {
    slug: "word.number.plural",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Plural", description: "More than one person, place, thing, or idea." },
    },
  },
  {
    slug: "word.aspect.imperfective",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Imperfective",
        description: "An action or state that is ongoing or repeated.",
      },
    },
  },
  {
    slug: "word.aspect.perfective",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Perfective", description: "An action or state that is completed." },
    },
  },
  {
    slug: "word.aspect.progressive",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Progressive", description: "An action or state that is in progress." },
    },
  },
  {
    slug: "word.aspect.habitual",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Habitual", description: "An action that takes place habitually." },
    },
  },
  {
    slug: "word.aspect.iterative",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Iterative", description: "An action that is repeated." },
    },
  },
  {
    slug: "word.aspect.prospective",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Prospective", description: "An action that is expected to take place." },
    },
  },
  {
    slug: "word.gender.feminine",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Feminine", description: "Female grammatical gender." },
    },
  },
  {
    slug: "word.gender.masculine",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Masculine", description: "Male grammatical gender." },
    },
  },
  {
    slug: "word.gender.neuter",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Neutral", description: "Neutral grammatical gender." },
    },
  },
  {
    slug: "word.degree.absolute",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Absolute", description: "An extreme degree of the base form." },
    },
  },
  {
    slug: "word.degree.comparative",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Comparative", description: "A higher or lower degree of the base form." },
    },
  },
  {
    slug: "word.degree.diminutive",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Diminutive",
        description: "A lesser degree or smaller version of something.",
      },
    },
  },
  {
    slug: "word.degree.superlative",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Superlative",
        description: "The highest or lowest degree of the base form.",
      },
    },
  },
  {
    slug: "word.definite.definite",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Definite", description: "Refers to something specific or known." },
    },
  },
  {
    slug: "word.definite.indefinite",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Indefinite", description: "Refers to something nonspecific or unknown." },
    },
  },
  {
    slug: "word.pronoun-type.personal",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Personal", description: "Refers to specific people or things." },
    },
  },
  {
    slug: "word.pronoun-type.article",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: { ONTOLOGICAL: {}, LABELED: { name: "Article", description: "Introduces nouns." } },
  },
  {
    slug: "word.pronoun-type.interrogative",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Interrogative", description: "Used to ask questions." },
    },
  },
  {
    slug: "word.pronoun-type.exclamative",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Exclamative", description: "Expresses strong emotions." },
    },
  },
  {
    slug: "word.pronoun-type.relative",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: { ONTOLOGICAL: {}, LABELED: { name: "Relative", description: "Links clauses." } },
  },
  {
    slug: "word.pronoun-type.demonstrative",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Demonstrative", description: "Points to specific things." },
    },
  },
  {
    slug: "word.pronoun-type.total",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Total", description: "Refers to all members of a group." },
    },
  },
  {
    slug: "word.pronoun-type.negative",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: { ONTOLOGICAL: {}, LABELED: { name: "Negative", description: "Indicates negation." } },
  },
  {
    slug: "word.pronoun-type.indefinite",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Indefinite", description: "Refers to non-specific things or people." },
    },
  },
  {
    slug: "word.possessive.yes",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Possessive", description: "Indicates possession." },
    },
  },
  {
    slug: "word.possessive.no",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Non-Possessive", description: "Does not indicate possession." },
    },
  },
  {
    slug: "word.reflexive.yes",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Reflexive", description: "The subject performs the action on itself." },
    },
  },
  {
    slug: "word.reflexive.no",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Non-Reflexive",
        description: "The action is not performed on the subject itself.",
      },
    },
  },
  {
    slug: "word.voice.active",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Active", description: "Subject performs the action." },
    },
  },
  {
    slug: "word.voice.passive",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Passive", description: "Subject receives the action." },
    },
  },
  {
    slug: "word.polarity.negative",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: { ONTOLOGICAL: {}, LABELED: { name: "Negative", description: "Indicates negation." } },
  },
  {
    slug: "word.prepositional-case.prepositional",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Prepositional Case",
        description: "This word form must be used after a preposition.",
      },
    },
  },
  {
    slug: "word.prepositional-case.non-prepositional",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Non-prepositional Case",
        description: "This word form must not be used after a preposition.",
      },
    },
  },
  {
    slug: "word.numeral-type.cardinal",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Cardinal", description: "A numeral expressing a quantity." },
    },
  },
  {
    slug: "word.numeral-type.ordinal",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Ordinal", description: "A numeral expressing position or order." },
    },
  },
  {
    slug: "word.numeral-type.multiplicative",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Multiplicative", description: "A numeral expressing how many times." },
    },
  },
  {
    slug: "word.numeral-type.fraction",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Fraction", description: "A numeral expressing a part of a whole." },
    },
  },
  {
    slug: "word.numeral-form.digit",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Digit", description: "Number expressed using digits (0-9)." },
    },
  },
  {
    slug: "word.numeral-form.roman",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Roman", description: "Number expressed using Roman numerals." },
    },
  },
  {
    slug: "word.numeral-form.word",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: { ONTOLOGICAL: {}, LABELED: { name: "Word", description: "Number expressed in words." } },
  },
  {
    slug: "word.adverb-type.locative",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Locative", description: "Adverbs of place (where, whence, whither)." },
    },
  },
  {
    slug: "word.adverb-type.temporal",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Temporal", description: "Adverbs of time (when, how long, how often)." },
    },
  },
  {
    slug: "word.case.nominative",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Nominative",
        description: "Subject case, used for sentence subjects and predicate nominatives.",
      },
    },
  },
  {
    slug: "word.case.accusative",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Accusative",
        description: "Direct object case, also used with certain prepositions.",
      },
    },
  },
  {
    slug: "word.case.genitive",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Genitive",
        description: "Possessive case, shows possession and partitive relationships.",
      },
    },
  },
  {
    slug: "word.case.dative",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Dative",
        description: "Indirect object case, recipient or beneficiary of an action.",
      },
    },
  },
  {
    slug: "word.case.ablative",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Ablative",
        description: "Instrumental/locative case, shows means, manner, place, time.",
      },
    },
  },
  {
    slug: "word.case.vocative",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Vocative",
        description: "Direct address case, used when calling or addressing someone.",
      },
    },
  },
  {
    slug: "word.name-type.given",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Given name", description: "Personal first names." },
    },
  },
  {
    slug: "word.name-type.surname",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Surname", description: "Family names or surnames." },
    },
  },
  {
    slug: "word.name-type.geographic",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Geographic", description: "Place names, geographical locations." },
    },
  },
  {
    slug: "word.name-type.literary",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Literary", description: "Titles of books, works, texts." },
    },
  },
  {
    slug: "word.name-type.religious",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Religious", description: "Religious or mythological names." },
    },
  },
  {
    slug: "word.name-type.ethnic-national",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Ethnic/National", description: "Names referring to peoples or nations." },
    },
  },
  {
    slug: "word.inflection-class.indo-european-a-stem",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Indo-European A-stem",
        description: "First declension (mostly feminine nouns).",
      },
    },
  },
  {
    slug: "word.inflection-class.indo-european-o-stem",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Indo-European O-stem",
        description: "Second declension (masculine and neuter nouns).",
      },
    },
  },
  {
    slug: "word.inflection-class.indo-european-i-stem",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Indo-European I-stem", description: "Third declension i-stem variation." },
    },
  },
  {
    slug: "word.inflection-class.indo-european-consonant-stem",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Indo-European consonant stem",
        description: "Third declension consonant stems.",
      },
    },
  },
  {
    slug: "word.inflection-class.indo-european-e-stem",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Indo-European E-stem", description: "Fifth declension (e-stem nouns)." },
    },
  },
  {
    slug: "word.inflection-class.indo-european-u-stem",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Indo-European U-stem", description: "Fourth declension (u-stem nouns)." },
    },
  },
  {
    slug: "word.inflection-class.latin-anomalous",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Latin anomalous", description: "Irregular Latin inflection patterns." },
    },
  },
  {
    slug: "word.inflection-class.latin-a-conjugation",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Latin A-conjugation", description: "First conjugation verbs (-are)." },
    },
  },
  {
    slug: "word.inflection-class.latin-e-conjugation",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Latin E-conjugation", description: "Second conjugation verbs (-ere)." },
    },
  },
  {
    slug: "word.inflection-class.latin-consonant-conjugation",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Latin consonant conjugation",
        description: "Third conjugation verbs (consonant stem).",
      },
    },
  },
  {
    slug: "word.inflection-class.latin-i-conjugation",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Latin I-conjugation", description: "Fourth conjugation verbs (-ire)." },
    },
  },
  {
    slug: "word.inflection-class.latin-pronominal",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Latin pronominal", description: "Pronominal inflection patterns." },
    },
  },
  {
    slug: "word.compound.yes",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Compound",
        description: "Word formed by combining multiple morphemes or roots.",
      },
    },
  },
  {
    slug: "word.foreign.yes",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Foreign", description: "Word borrowed from another language." },
    },
  },
  {
    slug: "word.suffix.ar",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: { ONTOLOGICAL: {}, LABELED: { name: "-ar", description: "Verbs ending in -ar." } },
  },
  {
    slug: "word.suffix.er",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: { ONTOLOGICAL: {}, LABELED: { name: "-er", description: "Verbs ending in -er." } },
  },
  {
    slug: "word.suffix.ir",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: { ONTOLOGICAL: {}, LABELED: { name: "-ir", description: "Verbs ending in -ir." } },
  },
  {
    slug: "word.regularity.regular",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Regular", description: "Follows standard conjugation patterns." },
    },
  },
  {
    slug: "word.regularity.irregular",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Irregular", description: "Deviates from standard conjugation patterns." },
    },
  },
];
