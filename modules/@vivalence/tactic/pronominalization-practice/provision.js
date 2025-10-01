import { Blacklist } from "@vivalence/typology";
import { array } from "@vivalence/shared";

export default async (inputs, ctx) => {
  const { scope, masks, relations } = inputs;
  const { games, tags } = relations;
  const blacklist = new Blacklist(inputs.blacklist);
  const language = ctx.runtime.statics.language;

  const [[verb], [tense], [person], [number]] = await Promise.all([
    ctx.runtime.call("/pick/tag/byStrength", { tags: tags.verbs, blacklist }),
    ctx.runtime.call("/pick/tag/byStrength", { tags: tags.tenses }),
    ctx.runtime.call("/pick/tag/byStrength", { tags: tags.persons }),
    ctx.runtime.call("/pick/tag/byStrength", { tags: tags.numbers }),
  ]);
  // if (!verb || !tense || !mood || !aspect) return []; // add some <empty> instruction here.

  const tagIds = [verb.id, tense.id, person.id, number.id];

  const $and = tagIds.map((id) => ({ tags: { id } }));
  const units = await ctx.runtime.entities.unit.find({ $and });
  const [action] = units;

  const instructions = [];
  // TRANSLATIONS
  const vocabulary = await ctx.runtime.call("/pick/units/pending", {
    scope: { ...scope, game: { id: games.nounform.id } },
    blacklist,
    tagIds: [tags.vocabulary.id, tags.nouns.id],
    take: 5,
  });

  const constraints = [
    `Verb / Action: ${language.learning}='${action.data.learning}' - ${language.known}='${action.data.known}'`,
  ];
  [verb, tense, person, number].map((t) => constraints.push(t.name));

  const format = (unit) =>
    `Possible ${tags.nouns.name}: ${unit.data.learning} - ${unit.data.known}`;
  constraints.push(...vocabulary.map(format));

  const [nounform] = await games.nounform.call(`/provision`, { constraints });

  instructions.push(nounform);
  constraints.push(
    "the sentence in nounform is:",
    nounform.instruction.sentence.known,
    nounform.instruction.sentence.learning,
    "... create the corresponding pronoun-form.",
  );
  const [pronounform] = await games.pronounform.call(`/provision`, {
    constraints,
  });
  instructions.push(pronounform);

  // FLASHCARDS
  let weakUnits = instructions
    .map(({ scope }) => scope.units.map((unit) => unit.id))
    .flat();

  weakUnits = await ctx.runtime.call("/pick/units/byStatus", {
    status: masks.flashcards.threshold,
    unitIds: weakUnits,
    blacklist: inputs.blacklist,
  });
  weakUnits = array.shuffle(weakUnits).slice(0, masks.flashcards.reps);

  const flashcards = await games.flashcards.call("/provision/fromUnits", {
    units: weakUnits,
  });

  return [flashcards, instructions].flat();
};
