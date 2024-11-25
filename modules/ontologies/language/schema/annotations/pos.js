export const pos = {
  $id: "ontology.pos",
  type: "string",
  title: "Part of Speech",
  description: "The part of speech category. ",
  enum: [
    "adj",
    "adp",
    "adv",
    "aux",
    "cconj",
    "det",
    "intj",
    "noun",
    "num",
    "part",
    "pron",
    "propn",
    "punct",
    "sconj",
    "verb",
  ],
};

export const meta = {
  slug: "pos",
  enums: {
    adj: {
      enum: "adj",
      title: "Adjective",
      description: "A word that modifies a noun or pronoun.",
    },
    adp: {
      enum: "adp",
      title: "Adposition",
      description: "A word that shows the relationship between its object and another word.",
    },
    adv: {
      enum: "adv",
      title: "Adverb",
      description: "A word that modifies a verb, an adjective, or another adverb.",
    },
    aux: {
      enum: "aux",
      title: "Auxiliary",
      description: "A verb used in forming tenses, moods, and voices.",
    },
    cconj: {
      enum: "cconj",
      title: "Coordinating Conjunction",
      description: "A word that connects words, phrases, or clauses of equal rank.",
    },
    det: {
      enum: "det",
      title: "Determiner",
      description: "A word that introduces a noun.",
    },
    intj: {
      enum: "intj",
      title: "Interjection",
      description: "A word or phrase that expresses strong emotion or surprise.",
    },
    noun: {
      enum: "noun",
      title: "Noun",
      description: "A word that refers to a person, place, thing, or idea.",
    },
    num: { enum: "num", title: "Numeral", description: "A word that expresses a number." },
    part: {
      enum: "part",
      title: "Particle",
      description:
        "A word that has grammatical function but does not fit into the main parts of speech.",
    },
    pron: {
      enum: "pron",
      title: "Pronoun",
      description: "A word that takes the place of a noun.",
    },
    propn: {
      enum: "propn",
      title: "Proper Noun",
      description: "A noun that denotes a particular person, place, or thing.",
    },
    punct: {
      enum: "punct",
      title: "Punctuation",
      description: "A symbol that indicates the structure and organization of writing.",
    },
    sconj: {
      enum: "sconj",
      title: "Subordinating Conjunction",
      description: "A conjunction that introduces a subordinate clause.",
    },
    verb: {
      enum: "verb",
      title: "Verb",
      description: "A word that expresses an action or a state of being.",
    },
  },
};
