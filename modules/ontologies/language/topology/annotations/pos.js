export const rule = {
  slug: "pos",
  type: "string",
  title: "Part of Speech",
  description: "The part of speech category. ",
  // enum: ["adj", "adp", "adv", "aux", "cconj", "det", "intj", "noun", "num", "part", "pron", "propn", "punct", "sconj", "verb",],
};

export const node = {
  slug: "pos",
  name: "part of speech",
  description: "High level grammatical grouping. Used for annotation.",
  traits: ["ANCESTOR", "TOPOGRAPHICAL", "CATEGORICAL"],
  data: {
    ANCESTOR: [
      {
        slug: "adj",
        name: "Adjective",
        description: "A word that modifies a noun or pronoun.",
      },
      {
        slug: "adp",
        name: "Adposition",
        description: "A word that shows the relationship between its object and another word.",
      },
      {
        slug: "adv",
        name: "Adverb",
        description: "A word that modifies a verb, an adjective, or another adverb.",
      },
      {
        slug: "aux",
        name: "Auxiliary Verb",
        description: "A verb used in forming tenses, moods, and voices.",
      },
      {
        slug: "cconj",
        name: "Coordinating Conjunction",
        description: "A word that connects words, phrases, or clauses of equal rank.",
      },
      {
        slug: "det",
        name: "Determiner",
        description: "A word that introduces a noun.",
      },
      {
        slug: "intj",
        name: "Interjection",
        description: "A word or phrase that expresses strong emotion or surprise.",
      },
      {
        slug: "noun",
        name: "Noun",
        description: "A word that refers to a person, place, thing, or idea.",
      },
      { slug: "num", name: "Numeral", description: "A word that expresses a number." },
      {
        slug: "part",
        name: "Particle",
        description:
          "A word that has grammatical function but does not fit into the main parts of speech.",
      },
      {
        slug: "pron",
        name: "Pronoun",
        description: "A word that takes the place of a noun.",
      },
      {
        slug: "propn",
        name: "Proper Noun",
        description: "A noun that denotes a particular person, place, or thing.",
      },
      {
        slug: "punct",
        name: "Punctuation",
        description: "A symbol that indicates the structure and organization of writing.",
      },
      {
        slug: "sconj",
        name: "Subordinating Conjunction",
        description: "A conjunction that introduces a subordinate clause.",
      },
      {
        slug: "verb",
        name: "Verb",
        description: "A word that expresses an action or a state of being.",
      },
    ],
  },
};
