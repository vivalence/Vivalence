import { Blacklist, array } from "@vivalence/shared";

const TRANSLATIONS_VOCAB_PROMPTSIZE = 4;

export default async function provision(inputs, ctx) {
  const { tactic, scope } = inputs;
  const { games, units, tags } = tactic.relations;
  const language = ctx.runtime.statics.language;
  const blacklist = new Blacklist(inputs.blacklist);

  // blacklist only if tags.x is longer than one.
  // maybe i need a picker for pending with fallback weakest.
  // something like a pipeline would be nice. where i define a bunch of pickers and it runs until take is satisfied.
  const [[gender], [number], [definiteness]] = await Promise.all([
    ctx.runtime.call("/pick/tags/byStrength", { tags: tags.gender }),
    ctx.runtime.call("/pick/tags/byStrength", { tags: tags.number }),
    ctx.runtime.call("/pick/tags/byStrength", { tags: tags.definite }),
  ]);

  const instructions = [];
  if (!definiteness || !gender || !number) return instructions;

  // possiblly add prose if number,gender,definiteness have no memory.
  // const constraints = proseConstraints({ gender, number, definiteness, translations, language });
  // const prose = await games.prose.call("/provision", { constraints });

  const conceptFlashcard = await games.flashcards.call("/provision/fromLLM", {
    concept: flashcardConcept({ gender, number, definiteness }),
    scope: { tags: [{ id: definiteness.id }, { id: number.id }, { id: gender.id }] },
  });
  instructions.push(...conceptFlashcard);

  let translations = [];
  const nouns = await ctx.runtime.call("/pick/units/pending", {
    scope: { ...scope, game: { id: games.translations.id } },
    blacklist,
    tagIds: [tags.vocabulary.id, tags.nouns.id, gender.id],
    take: tactic.masks.translations.reps * TRANSLATIONS_VOCAB_PROMPTSIZE,
  });
  let adjectives = [];
  if (tags.adjectives) {
    adjectives = await ctx.runtime.call("/pick/units/pending", {
      scope: { ...scope, game: { id: games.translations.id } },
      blacklist,
      tagIds: [tags.vocabulary.id, tags.adjectives.id],
      take: tactic.masks.translations.reps * TRANSLATIONS_VOCAB_PROMPTSIZE,
    });
  }

  for (const vocabulary of array.chunk(nouns, TRANSLATIONS_VOCAB_PROMPTSIZE)) {
    if (adjectives.length > 0) {
      vocabulary.push(...adjectives.splice(0, TRANSLATIONS_VOCAB_PROMPTSIZE));
    }
    const constraints = translationConstraints({
      gender,
      number,
      definiteness,
      vocabulary,
      tactic,
    });
    const translation = games.translations.call("/provision", { constraints });
    translations.push(translation);
  }
  translations = (await Promise.all(translations)).flat();

  const unitIds = translations
    .map((t) => t.scope.units)
    .flat()
    .map((u) => u.id);
  const weakUnits = await ctx.runtime.call("/pick/units/byStatus", {
    status: tactic.masks.flashcards.threshold,
    unitIds,
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
function translationConstraints({ gender, number, definiteness, vocabulary, tactic }) {
  return [
    // i'd guess the arrays merge, which will result in contradicting constraints.
    ...(tactic.masks.translations?.constraints ?? []),
    "Create a simple statement with an article given the following constraints:",
    `gender: ${gender.name}`,
    `number: ${number.name}`,
    `definiteness: ${definiteness.name}`,
    `vocabulary (language known / language learning):`,
    ...vocabulary.map((unit) => `${unit.data.known} / ${unit.data.learning}`),
  ];
}
