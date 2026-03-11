export default [
  {
    slug: "sentence",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Sentence", description: "A sentence" },
    },
  },
  // force
  {
    slug: "sentence.force.declarative",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Declarative",
        description: "A clause that asserts a proposition as true or false.",
      },
    },
  },
  {
    slug: "sentence.force.interrogative",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Interrogative",
        description: "A clause that requests information or confirmation from an addressee.",
      },
    },
  },
  {
    slug: "sentence.force.imperative",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Imperative",
        description: "A clause that directs an addressee to perform or refrain from an action.",
      },
    },
  },
  {
    slug: "sentence.force.exclamative",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Exclamative",
        description:
          "A clause that expresses an evaluative or affective stance toward a proposition.",
      },
    },
  },
  {
    slug: "sentence.force.optative",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Optative",
        description: "A clause that expresses a wish or desire, typically using subjunctive mood.",
      },
    },
  },

  // finiteness
  {
    slug: "sentence.finiteness.finite",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Finite",
        description:
          "Fully inflected for tense, mood, person, and number. Temporally anchored to the speech event.",
      },
    },
  },
  {
    slug: "sentence.finiteness.infinitival",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Infinitival",
        description:
          "Non-finite clause lacking tense and agreement. Typically functions as complement or adjunct.",
      },
    },
  },
  {
    slug: "sentence.finiteness.participial",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Participial",
        description: "Non-finite clause headed by a participle. Adjectival or passive-forming.",
      },
    },
  },
  {
    slug: "sentence.finiteness.gerundial",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Gerundial",
        description: "Non-finite clause headed by a gerund. Nominal or progressive function.",
      },
    },
  },

  // mood
  {
    slug: "sentence.mood.indicative",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Indicative", description: "Presents the proposition as factual or real." },
    },
  },
  {
    slug: "sentence.mood.subjunctive",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Subjunctive",
        description: "Presents the proposition as hypothetical, desired, or doubted.",
      },
    },
  },
  {
    slug: "sentence.mood.conditional",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Conditional",
        description: "Presents the proposition as contingent on a condition being met.",
      },
    },
  },
  {
    slug: "sentence.mood.imperative",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Imperative",
        description: "Directive mood commanding or requesting action.",
      },
    },
  },
  {
    slug: "sentence.mood.jussive",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Jussive",
        description:
          "Third-person directive or strong wish. Distinct from imperative in addressee targeting.",
      },
    },
  },

  // tense
  {
    slug: "sentence.tense.present",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Present",
        description: "Event coincides with or surrounds the moment of speech.",
      },
    },
  },
  {
    slug: "sentence.tense.past",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Past", description: "Event precedes the moment of speech." },
    },
  },
  {
    slug: "sentence.tense.future",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Future", description: "Event follows the moment of speech." },
    },
  },
  {
    slug: "sentence.tense.imperfect",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Imperfect",
        description: "Ongoing or habitual event situated in the past.",
      },
    },
  },
  {
    slug: "sentence.tense.pluperfect",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Pluperfect",
        description: "Event completed before another past reference point.",
      },
    },
  },

  // aspect
  {
    slug: "sentence.aspect.perfective",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Perfective",
        description: "Event viewed as a completed whole with a definite boundary.",
      },
    },
  },
  {
    slug: "sentence.aspect.imperfective",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Imperfective",
        description: "Event viewed as ongoing, habitual, or without reference to completion.",
      },
    },
  },
  {
    slug: "sentence.aspect.progressive",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Progressive",
        description: "Event explicitly in progress at the reference time.",
      },
    },
  },

  // polarity
  {
    slug: "sentence.polarity.positive",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Positive", description: "The proposition is affirmed." },
    },
  },
  {
    slug: "sentence.polarity.negative",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Negative", description: "The proposition is denied or reversed." },
    },
  },

  // voice
  {
    slug: "sentence.voice.active",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Active",
        description: "The grammatical subject is the agent of the action.",
      },
    },
  },
  {
    slug: "sentence.voice.passive",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Passive",
        description: "The grammatical subject is the patient; the agent is demoted or absent.",
      },
    },
  },
  {
    slug: "sentence.voice.middle",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Middle",
        description:
          "The subject is both agent and affected. Covers reflexive and anticausative constructions.",
      },
    },
  },

  // interrogative_type
  {
    slug: "sentence.interrogative-type.polar",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Polar",
        description: "Yes/no question. Requests confirmation or denial of the full proposition.",
      },
    },
  },
  {
    slug: "sentence.interrogative-type.content",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Content",
        description: "Wh-question. Requests a specific constituent; requires a wh-element.",
      },
    },
  },
  {
    slug: "sentence.interrogative-type.alternative",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Alternative",
        description: "Offers a closed set of options to the addressee: A or B?",
      },
    },
  },

  // wh_element
  {
    slug: "sentence.wh-element.what",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "What", description: "Questions a thing, fact, or action." },
    },
  },
  {
    slug: "sentence.wh-element.who",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Who", description: "Questions a person or agent." },
    },
  },
  {
    slug: "sentence.wh-element.where",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Where", description: "Questions a location or destination." },
    },
  },
  {
    slug: "sentence.wh-element.when",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "When", description: "Questions a time or temporal frame." },
    },
  },
  {
    slug: "sentence.wh-element.how",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "How", description: "Questions a manner, degree, or means." },
    },
  },
  {
    slug: "sentence.wh-element.why",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Why", description: "Questions a cause, reason, or purpose." },
    },
  },
  {
    slug: "sentence.wh-element.which",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Which", description: "Questions a selection from a known or implied set." },
    },
  },

  // evidentiality
  {
    slug: "sentence.evidentiality.direct",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Direct", description: "The speaker witnessed the event firsthand." },
    },
  },
  {
    slug: "sentence.evidentiality.reported",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Reported",
        description: "The speaker received the information from another source.",
      },
    },
  },
  {
    slug: "sentence.evidentiality.inferred",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Inferred",
        description: "The speaker deduced the proposition from indirect evidence.",
      },
    },
  },

  // politeness
  {
    slug: "sentence.politeness.informal",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Informal", description: "Familiar register. Tu/você imperative form." },
    },
  },
  {
    slug: "sentence.politeness.polite",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: {
        name: "Polite",
        description: "Softened directive. Você + subjunctive or modal mitigation.",
      },
    },
  },
  {
    slug: "sentence.politeness.formal",
    traits: ["ONTOLOGICAL", "LABELED"],
    data: {
      ONTOLOGICAL: {},
      LABELED: { name: "Formal", description: "Formal register. O senhor / a senhora address." },
    },
  },
];
