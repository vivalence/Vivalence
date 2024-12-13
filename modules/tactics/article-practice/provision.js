import { blacklist as Blacklist, array } from "@vivalence/shared";

const TRANSLATIONS_VOCAB_PROMPTSIZE = 3;
const TRANSLATIONS_COUNT = 5;

export default async function provision(inputs, ctx) {
  const { tactic, scope } = inputs;
  const { games, units, tags } = tactic.relations;
  const language = ctx.runtime.statics.language;
  let blacklist = inputs.blacklist;

  const [definiteness] = await ctx.runtime.call("/pick/tags/byStrength", {
    tags: tags.definite,
    blacklist,
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

  const instructions = [];
  if (!definiteness || !gender || !number) return instructions;

  // possiblly add prose if number,gender,definiteness have no memory.
  // const constraints = proseConstraints({ gender, number, definiteness, translations, language });
  // const prose = await games.prose.call("/provision", { constraints });

  const concept = flashcardConcept({ gender, number, definiteness });
  const conceptFlashcard = await games.flashcards.call("/provision/fromLLM", {
    concept,
    scope: { tags: [{ id: definiteness.id }, { id: number.id }, { id: gender.id }] },
  });
  instructions.push(...conceptFlashcard);

  const vocabulary = await ctx.runtime.call("/pick/units/pending", {
    tagIds: [tags.vocabulary.id, gender.id],
    blacklist,
    scope: { ...scope, game: { id: games.translations.id } },
    take: TRANSLATIONS_COUNT * TRANSLATIONS_VOCAB_PROMPTSIZE,
  });

  let translations = [];
  for (const vocab of array.chunk(vocabulary, TRANSLATIONS_VOCAB_PROMPTSIZE)) {
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
    blacklist,
  });
  const flashcards = await games.flashcards.call("/provision/fromUnits", { units: weakUnits });
  instructions.push(...flashcards, ...translations);

  return instructions;
}

function flashcardConcept({ gender, number, definiteness }) {
  const def = definiteness.data.ONTOLOGICAL;
  const gen = gender.data.ONTOLOGICAL;
  const num = number.data.ONTOLOGICAL;

  return `Generate a flashcard for the article that correctly marks:
${definiteness.name} (${def.branch}:${def.leaf}) 
${gender.name} (${gen.branch}:${gen.leaf}) 
${number.name} (${num.branch}:${num.leaf})  

The concept should be explained clearly with examples that demonstrate all three properties working together.

Example output should test understanding of the correct article form for this combination.`;
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
