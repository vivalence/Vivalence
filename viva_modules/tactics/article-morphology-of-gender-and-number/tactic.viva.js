import provision from "./provision.js";

const tactic = {
  relations: {
    units: {},
    tags: {
      structural: { slug: "structural:a1" },
      vocabulary: [{ slug: "pos:noun" }, { slug: "pos:adj" }],
      articles: { slug: "prontype:art" },
      numbers: [{ slug: "number:sing" }, { slug: "number:plur" }],
      genders: [{ slug: "gender:masc" }, { slug: "gender:fem" }],
    },
    games: {
      flashcards: { slug: "flashcards" },
      translations: { slug: "translations" },
    },
  },
  masks: {
    translations: {
      prompt: {
        inner: `### Task:
Create simple statements to practice the usage of present tense verbs with a noun for A1 language learners.
Usage of present tense verbs and nouns on A1 level.
1 VERB + 1 NOUN

### Examples:
He eats bread. - Él come pan. (Masculine Singular)
She reads a book. - Ella lee un libro. (Feminine Singular)
They play soccer. - Ellos juegan fútbol. (Masculine Plural)

### Instructions:
The sentence should be made up of 2 parts. One (1) verb in the present tense and one (1) noun.
Choose common, everyday nouns suitable for A1 level language learners.
The statement must make sense, possibly occur in written text or conversation, and be clear for a language learner.
I will provide the verb. Take the provided verb exactly. Don't change its tense or person. `,
      },
    },
  },
};

export default {
  manifest: {
    type: "Tactic",
    name: "Morphology of Articles with gender and number",
    slug: "article-morphology-gender-and-number",
    version: "0.0.3",
    description:
      "Learn how to properly use gender and number of vocabulary by repetition of flashcards.",
    modules: {
      domain: "file://../../domain/domain.viva.js",
      ontology: "file://../../ontology/ontology.viva.js",
    },
  },
  tactic,
  provision,
};
