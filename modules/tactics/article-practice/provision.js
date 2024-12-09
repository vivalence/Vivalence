import { blacklist as Blacklist, array } from "@vivalence/shared";

const TRANSLATIONS_VOCAB_GROUPSIZE = 3;
const TRANSLATIONS_COUNT = 6;

export default async function provision(inputs, ctx) {
  const { tactic, scope } = inputs;
  const { games, units, tags } = tactic.relations;
  const language = ctx.runtime.statics.language;
  let blacklist = inputs.blacklist;

  const [definiteness] = await ctx.runtime.call("/pick/tags/byStrength", {
    tags: tags.definite,
    take: 1,
  });
  const [gender] = await ctx.runtime.call("/pick/tags/byStrength", {
    tags: tags.gender,
    take: 1,
  });
  const [number] = await ctx.runtime.call("/pick/tags/byStrength", {
    tags: tags.number,
    take: 1,
  });

  const vocabulary = await ctx.runtime.call("/pick/units/pending", {
    tagIds: [tags.vocabulary.id, gender.id],
    blacklist,
    scope,
    take: TRANSLATIONS_COUNT * TRANSLATIONS_VOCAB_GROUPSIZE,
  });
  console.log(definetness, gender, number, vocabulary);

  let translations = [];
  for (const vocab of array.chunk(vocabulary, TRANSLATIONS_VOCAB_GROUPSIZE)) {
    const constraints = translationConstraints({ gender, number, definiteness, vocab });
    const translation = games.translations.call("/provision", { constraints });
    translations.push(translation);
  }
  translations = await Promise.all(translations);

  const unitIds = translations.map((t) => t.scope.units).flat();
  const weakUnits = await ctx.runtime.call("/pick/units/byStatus", {
    status: tactic.masks.flashcards.status,
    unitIds: unitIds.map((u) => u.id),
    take: translations.length,
  });
  const flashcards = await games.flashcards.call("/provision/fromUnits", { units: weakUnits });
  // const constraints = proseConstraints({ gender, number, definiteness, translations, language });
  // const prose = await games.prose.call("/provision", { constraints });

  return [...flashcards, ...translations];
}

function translationConstraints({ gender, number, definiteness, vocab }) {
  return [
    "Create a simple statement with an article given the following constraints:",
    `gender: ${gender.name}`,
    `number: ${number.name}`,
    `definiteness: ${definiteness.name}`,
    `vocabulary: known / learning`,
    ...vocab.map((unit) => `${unit.data.known} / ${unit.data.learning}`),
    "Dont ever use vocabulary thats more advanced than whats provided.",
    "Dont ever go longer than 4 words.",
    "Create very very very simple statements. Like a child would say or use for practice.",
    "The statement is just there to practice the article. thats it. nothing more.",
    "Dont include an article. Just the noun.",
    "Follow this simple template: '[article] [noun]'",
    "The English form must unambiguously indicate which Spanish article is expected",
  ];
}
function proseConstraints({ gender, number, definiteness, translations, language }) {
  return [
    `The learner's native language is ${language.known} and the target language being learned is ${language.learning}.`,
    `You create a short explainer. Explain the relationship between articles / article morphology, and the gender, number and definiteness.`,
    `The user will read this explainer, and translate a few statements afterward.`,
    `The sentences are these:`,
    translations.map((t) => JSON.stringify(t.instruction.sentence)).join(", "),
    `use the some of the sentences to explain the relationship between articles and the grammatical features.`,
    `The grammatical features to be explained are: Gender: ${gender.name}. Number: ${number.name}. Definiteness: ${definiteness.name}.`,
    `The explainer should be simple and easy to understand. It should be written in a way that a child could understand it.`,
    `Use the following template/structure to write the explainer:`,
    `
{Comparing article usage between source and target languages}

{Core rules explanation:
- how [x1] affects articles
- how [x2] affects articles  
- how [x3] affects articles}

{Pattern demonstration showing rules working together with concrete examples}
`,
    "Around 150 words or 2 paragraphs. Never more than 180 words or 3 paragraphs.",
  ];
}
