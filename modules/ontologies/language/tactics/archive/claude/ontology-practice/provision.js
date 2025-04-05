import { blacklist as Blacklist, array } from "@vivalence/shared";

export default async function provision(inputs, ctx) {
  const { tactic, scope } = inputs;
  const { games, units, tags } = tactic.relations;
  let blacklist = inputs.blacklist;

  // 1. DISCOVER LEARNING TARGET
  const [targetFeature] = await ctx.runtime.call("/pick/tags/byStrength", {
    tags: tags.target,
    blacklist,
    take: 1,
  });

  // Also get modifiers if they exist (e.g., number for gender practice)
  const modifiers = await Promise.all(
    (tags.modifiers || []).map((tag) =>
      ctx.runtime.call("/pick/tags/byStrength", {
        tags: [tag],
        take: 1,
      }),
    ),
  );

  if (!targetFeature) return [];

  // 2. GET CONTEXT VOCABULARY
  const contextUnits = await ctx.runtime.call("/pick/units/pending", {
    tagIds: [tags.structural.id, ...tags.context.map((t) => t.id), targetFeature.id],
    blacklist,
    scope: { ...scope, game: { id: games.translations.id } },
    take: 5,
  });

  // 3. BUILD PROSE INSTRUCTION
  const prose = await games.prose.call("/provision", {
    constraints: [
      `Feature: ${targetFeature.name}`,
      `Context: ${contextUnits.map((u) => u.data.learning).join(", ")}`,
      ...modifiers.map((m) => `Modified by: ${m.name}`),
    ],
    scope: { tags: [{ id: targetFeature.id }] },
  });

  // 4. GENERATE PRACTICE TRANSLATIONS
  const translations = await Promise.all(
    array.chunk(contextUnits, 2).map((units) => {
      const constraints = [
        `Feature to demonstrate: ${targetFeature.name}`,
        `Available vocabulary: ${units
          .map((u) => `${u.data.known} - ${u.data.learning}`)
          .join(", ")}`,
        `Must clearly demonstrate: ${targetFeature.data.ONTOLOGICAL.branch}:${targetFeature.data.ONTOLOGICAL.leaf}`,
        ...modifiers.map(
          (m) => `Must agree with: ${m.data.ONTOLOGICAL.branch}:${m.data.ONTOLOGICAL.leaf}`,
        ),
      ];
      return games.translations.call("/provision", { constraints });
    }),
  );

  // 5. REINFORCE WEAK POINTS
  const weakUnits = await ctx.runtime.call("/memory/filter/units", {
    units: translations.map((t) => t.scope.units).flat(),
    accept: ["UNKNOWN", "LEARNING"],
    take: 3,
  });

  const flashcards = await games.flashcards.call("/provision/fromUnits", {
    units: weakUnits,
  });

  return [prose, ...translations, ...flashcards];
}
