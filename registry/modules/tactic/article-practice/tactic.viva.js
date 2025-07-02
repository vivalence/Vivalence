import provision from "./provision.js";

const manifest = {
  type: "tactic",
  name: "article morphology intro",
  description: "",
  slug: "article-practice",
  version: "0.0.6",
};

const relations = {
  tags: {
    vocabulary: { slug: "vocabulary:a1" },
    nouns: { slug: "pos:noun" },
    // adjectives: { slug: "pos:adj" },
    article: { slug: "prontype:art" },
    gender: [], // { slug: "gender:masc", }, { slug: "gender:fem", },
    number: [], // { slug: "number:sing", }, { slug: "number:plur", },
    definite: [], // { slug: "definite:def", }, { slug: "definite:ind", },
  },
  games: {
    translations: { slug: "translations" },
    flashcards: { slug: "flashcards" },
    prose: { slug: "prose" },
  },
};

const masks = {
  flashcards: {
    reps: 4,
    threshold: ["UNTOUCHED", "UNKNOWN", "LEARNING"],
  },
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
    reps: 4,
    goal: `
The user is practicing the usage of Articles in spanish.
The article must agree and be demonstrated.
Your task is to create a very very short and simple sentence, using specific vocabulary and following grammatical constraints.

Dont ever use vocabulary thats more advanced than whats provided.
Create very very very simple statements. Like a child would say or use for practice.
The statement is just there to practice the article. thats it. nothing more.
The English form must unambiguously indicate which Spanish article is expected.

You're given a list of nouns, which serves as the available vocabulary. 
You're given grammatical constraints for: definiteness, gender, and number. 
The sentence must be simple, because a A1 language learner will translate that sentence for practice.
Important: the sentence must follow the provided grammar and vocabulary.

Follow this simple template: '[article] [noun]'.

No verbs.
`,
  },
};

const data = { relations, masks };

export { manifest, data, provision };
