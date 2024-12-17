// conjugation-practice/provision.js
export default async function provision(inputs, ctx) {
  const { tactic, scope } = inputs;
  const { games, units, tags } = tactic.relations;
  let blacklist = inputs.blacklist;

  // 1. SELECT VERB TO PRACTICE
  const [verb] = await ctx.runtime.call("/pick/tags/byStrength", {
    tags: tags.target, // Verb lemmas
  });

  // Get required modifiers (tense, mood)
  const [tense, mood] = await Promise.all([
    ctx.runtime.call("/pick/tags/byStrength", {
      tags: tags.modifiers.filter((t) => t.data.ONTOLOGICAL.branch === "tense"),
      take: 1,
    }),
    ctx.runtime.call("/pick/tags/byStrength", {
      tags: tags.modifiers.filter((t) => t.data.ONTOLOGICAL.branch === "mood"),
      take: 1,
    }),
  ]);

  if (!verb || !tense || !mood) return [];

  // 2. CONJUGATION PRACTICE
  const conjugations = await games.conjugations.call("/provision", {
    tags: { verb, tense, mood },
    blacklist,
  });
  blacklist = Blacklist.fromScope({ blacklist, scope: conjugations.scope });

  // 3. CONTEXTUAL PRACTICE
  // Get vocabulary for meaningful sentences
  const contextUnits = await ctx.runtime.call("/pick/units/pending", {
    tagIds: [tags.structural.id, ...tags.context.map((t) => t.id)],
    blacklist,
    scope: { ...scope, game: { id: games.translations.id } },
    take: 3,
  });

  // Generate translations using conjugated forms
  const translations = await Promise.all(
    conjugations.forms.map((form) => {
      const constraints = [
        `Use exact verb form: "${form.learning}" (${form.known})`,
        `Available context words: ${contextUnits
          .map((u) => `${u.data.known} - ${u.data.learning}`)
          .join(", ")}`,
        "Create natural sentences that require this exact form",
      ];
      return games.translations.call("/provision", { constraints });
    }),
  );

  // 4. REINFORCEMENT
  const flashcards = await games.flashcards.call("/provision/fromUnits", {
    units: [
      conjugations.scope.units[0], // The main verb
      ...contextUnits.slice(0, 2), // Some context vocabulary
    ],
  });

  return [conjugations, ...translations, ...flashcards];
}
