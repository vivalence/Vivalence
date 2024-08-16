import Mustache from "mustache";

export default async function generate(inputs, ctx) {
  const { gameId, tags } = inputs;

  const { data: game, error: errorGame } = await ctx.runtime.locals.supabase
    .from("Game")
    .select(`id, data`)
    .eq("id", gameId)
    .single();
  if (errorGame) throw errorGame;

  // // POST TENSE TAG //
  const [tenseTag] = await ctx.runtime.call("/tags/fromTagIds", {
    tagIds: [tags.tense.id],
    take: 1,
  });

  // // POST INFINITIVE UNIT //
  const [infinitiveVerb] = await ctx.runtime.call("/units/fromTagIds", {
    tagIds: [INFINITIVE_TAG, tags.verb.id],
    take: 1,
  });

  // // POST CONJUGATION UNITS //
  const tagIds = [tags.verb.id, tags.tense.id, tags.mood.id];
  const conjugationUnits = await ctx.runtime.call("/units/fromTagIds", { tagIds });
  if (!conjugationUnits.length !== 6) {
    new Error("not the right number of conjugation units found", tags);
  }

  const units = conjugationUnits.sort(sortByPerformer);

  const conjugations = [];
  for (const [index, unit] of units.entries()) {
    conjugations.push({
      spoken: `${unit.data.english}`,
      learning: `${unit.data.spanish}`,
      scope: { unit: { id: unit.id, tags: tagIds.map((id) => ({ id })) } },
      meta: { index },
    });
  }

  // // INSTRUCTIONS //
  const instruction = {
    type: "CONJUGATIONS",
    instruction: {
      tense: tenseTag.data.ONTOLOGICAL.leaf,
      verb: {
        spoken: infinitiveVerb.data.english,
        learning: infinitiveVerb.data.spanish,
      },
      conjugations,
    },
    scope: {
      tags: Object.keys(tags).map((key) => ({ id: tags[key].id, role: key })),
      units: conjugations.map(({ scope }) => scope.unit),
      game: { id: gameId },
    },
  };
  return instruction;
}

export const sortByPerformer = (a, b) => {
  const sumSortValues = (unit) =>
    unit.tags.reduce((sum, tag) => {
      const { leaf, branch } = tag.data.ONTOLOGICAL;
      if (branch === "person") return sum + parseInt(leaf);
      if (branch === "number") return leaf === "sing" ? sum + 0 : sum + 10;
      return sum;
    }, 0);

  return sumSortValues(a) - sumSortValues(b);
};
