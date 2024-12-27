import provision from "./provision.js";

const manifest = {
  type: "tactic",
  name: "Morphology of Articles",
  description: "Practice the use of articles in different contexts.",
  slug: "article-morphology-practice",
  version: "0.0.4",
};

const relations = {
  tags: {
    article: { slug: "prontype:art" },
    vocabulary: { slug: "pos:noun" },
    morphology: [],
    // adjective: { slug: "pos:adj" },
    // numbers: [{ slug: "number:sing" }, { slug: "number:plur" }],
    // genders: [{ slug: "gender:masc" }, { slug: "gender:fem" }],
    // definites: [{ slug: "definite:def" }, { slug: "definite:ind" }],
  },
  games: {
    flashcards: { slug: "flashcards" },
    translations: { slug: "translations" },
    prose: { slug: "prose" },
  },
};

const masks = {
  translations: {
    prompt: {
      goal: `

Create simple statements to practice the usage of present tense verbs with a noun for A1 language learners.
Usage of present tense verbs and nouns on A1 level.
1 VERB + 1 NOUN

The sentence should be made up of 2 parts. One (1) verb in the present tense and one (1) noun.
Choose common, everyday nouns suitable for A1 level language learners.
The statement must make sense, possibly occur in written text or conversation, and be clear for a language learner.
I will provide the verb. Take the provided verb exactly. Don't change its tense or person. 

### Examples:
He eats bread. - Él come pan. (Masculine Singular)
She reads a book. - Ella lee un libro. (Feminine Singular)
They play soccer. - Ellos juegan fútbol. (Masculine Plural)

`,
    },
  },
};

const data = { relations, masks };

export { manifest, data, provision };
