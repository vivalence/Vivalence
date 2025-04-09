import { Blacklist, array } from "@vivalence/shared";

// Utility function for proportional distribution across categories
function distributeProportionally(categories, totalSlots) {
  // Filter out undefined categories
  const validCategories = categories.filter((cat) => cat.tags && cat.tags.length > 0);

  // Normalize proportions if they don't sum to 1
  const totalProportion = validCategories.reduce((sum, cat) => sum + cat.proportion, 0);
  const normalizedCategories = validCategories.map((cat) => ({
    ...cat,
    proportion: cat.proportion / totalProportion,
  }));

  // Distribute slots based on proportions
  let remainingSlots = totalSlots;
  let result = [];

  // Allocate slots to all categories except the last one
  for (let i = 0; i < normalizedCategories.length - 1; i++) {
    const slots = Math.round(totalSlots * normalizedCategories[i].proportion);
    result.push({ ...normalizedCategories[i], slots });
    remainingSlots -= slots;
  }

  // Allocate remaining slots to the last category
  if (normalizedCategories.length > 0) {
    result.push({
      ...normalizedCategories[normalizedCategories.length - 1],
      slots: Math.max(0, remainingSlots),
    });
  }

  return result;
}

// i could refactor the probablility per pos into the interface.
export default async function provision(inputs, ctx) {
  const { tactic, scope } = inputs;
  const { games, tags } = tactic.relations;
  const blacklist = new Blacklist(inputs.blacklist || []);

  // Define part of speech categories with proportions
  const posCategories = [
    { tags: tags.nouns, proportion: 0.4, name: "nouns" },
    { tags: tags.verbs, proportion: 0.3, name: "verbs" },
    { tags: tags.adjectives, proportion: 0.2, name: "adjectives" },
    { tags: tags.adverbs, proportion: 0.1, name: "adverbs" },
  ].filter((category) => category.tags);

  // Calculate how many units to fetch for each category
  const totalUnits = tactic.masks.reps || 10;
  const distribution = distributeProportionally(posCategories, totalUnits);

  // Fetch units for each part of speech according to the distribution
  const unitPromises = distribution.map(async (category) => {
    if (category.slots <= 0) return [];

    return ctx.runtime.call("/pick/units/pending", {
      scope: { ...scope, game: { id: games.flashcards.id } },
      blacklist,
      tagIds: [tags.vocabulary.id, category.tags.id],
      take: category.slots,
      status: tactic.masks.threshold,
    });
  });

  // Collect all units
  const unitsByCategory = await Promise.all(unitPromises);
  const allUnits = array.shuffle(unitsByCategory.flat());

  // Generate flashcards
  const flashcards = await games.flashcards.call("/provision/fromUnits", {
    units: allUnits,
    // Pass any flashcard-specific formatting options
    mask: tactic.masks.flashcard || {},
  });

  return flashcards;
}
