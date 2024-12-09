import provision from "./provision.js";

const manifest = {
  type: "tactic",
  name: "article morphology intro",
  description: "",
  slug: "article-practice",
  version: "0.0.3",
};

const relations = {
  tags: {
    vocabulary: { slug: "pos:noun" },
    article: { slug: "prontype:art" },
    definite: [
      { slug: "definite:def", description: "Definite form is familiar" },
      { slug: "definite:ind", description: "Indefinite form is familiar" },
    ],
    gender: [
      { slug: "gender:masc", description: "Masculine form is familiar" },
      { slug: "gender:fem", description: "Feminine form is familiar" },
    ],
    number: [
      { slug: "number:sing", description: "Singular form is familiar" },
      { slug: "number:plur", description: "Plural form is familiar" },
    ],
  },
  games: {
    translations: { slug: "translations" },
    flashcards: { slug: "flashcards" },
    prose: { slug: "prose" },
  },
};

const masks = {
  flashcards: { status: [null, "UNTOUCHED", "UNKNOWN"] },
  prose: {
    prompt: {
      goal: `The reader is a language learner that is practicing sentence translations with focus on a specific grammatical concept.
Generate clear, beginner-friendly language learning content explaining a specific grammatical feature.
Use simple language to explain the concept, plenty of examples, and visual aids.
Assume the reader is an absolute beginner encountering this grammatical aspect for the first time.
Around 150 words or 2 paragraphs.
`,
    },
  },
  translations: {
    prompt: {
      goal: `
The user is practicing the usage of Articles in spanish.
The article must agree and be demonstrated.
Your task is to create a very very short and simple sentence, using specific vocabulary and following grammatical constraints.

You're given a list of nouns, which serves as the available vocabulary. 
You're given grammatical constraints for: definiteness, gender, and number. 
The sentence must be simple, because a A1 language learner will translate that sentence for practice.
Important: the sentence must follow the provided grammar and vocabulary.
Aim for 2 to 4 words for the sentence.
`,
    },
  },
};

const data = { relations, masks };

export { manifest, data, provision };
