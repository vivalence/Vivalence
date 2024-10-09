import provision from "./provision.js";

const tactic = {
  relations: {
    tags: {
      aspects: [],
    },
    games: {
      prose: { slug: "prose" },
      translations: { slug: "translations" },
    },
  },
  masks: {
    aspect: { memory: { accept: [null] } },
    prose: {
      prompt: {
        goal: `The reader is a language learner that is introduced to a grammatical concept.
Generate clear, beginner-friendly language learning content explaining a specific grammatical feature.
Use simple language, plenty of examples, and visual aids (using HTML and Tailwind Typography's .prose elements) to illustrate the concept.
Assume the reader is an absolute beginner encountering this grammatical aspect for the first time.
Include examples to reinforce understanding.`,
      },
    },

    translations: {
      prompt: {
        goal: `
You're given an explanation of a grammatical concept, that includes examples.
Your task is to extract an example sentence from the explanation.
The goal is for the user to translate that sentence for practice.

1. Extract a sentence from the explanation that demonstrates the concept. 
2. Use simple, everyday vocabulary suitable for the learner's level.
3. The sentence should be clear, concise, and make sense in conversation or writing.
4. Ensure the sentence untilizes correct grammar and vocabulary.
`,
      },
    },
  },
};

const manifest = {
  type: "Tactic",
  name: "Grammar Branch Introduction",
  slug: "ontological-branch-introduction",
  version: "0.0.7",
  description: "",
};

export { manifest, tactic, provision };
