import Mustache from "mustache";

export default async function provision(inputs, ctx) {
  const { tags, mask, blacklist, scope } = inputs;
  const { language } = ctx.runtime.statics;

  let tagIds = [tags.verb.id, tags.tense.id, tags.mood.id, tags.aspect.id];
  const conjugationUnits = await ctx.runtime.call("/units/fromTagIds", { tagIds });

  tagIds = [mask.tags.infinitive.id, tags.verb.id];
  const [infinitiveVerb] = await ctx.runtime.call("/units/fromTagIds", { tagIds });

  if (!infinitiveVerb || conjugationUnits.length !== 6) {
    new Error("not the right number of conjugation units found", {
      infinitiveVerb,
      conjugationUnits,
      inputs,
    });
  }

  const conjugations = conjugationUnits.sort(sortByPerformer).map((unit, index) => ({
    known: `${unit.data.known}`,
    learning: `${unit.data.learning}`,
    meta: { index },
    scope: {
      unit: {
        id: unit.id,
      },
      tags: unit.tags
        .filter((tag) => tag.traits.includes("LEARNABLE"))
        .map((tag) => ({ id: tag.id })),
    },
  }));

  scope.units = conjugations.map(({ scope }) => scope.unit);
  scope.tags = Array.from(
    new Set([
      ...conjugations
        .map(({ scope }) => scope.tags)
        .map((tags) => tags.map(({ id }) => id))
        .flat(),
    ]),
  ).map((id) => ({ id }));

  const instruction = {
    type: "CONJUGATIONS",
    instruction: {
      tense: tags.tense.name,
      mood: tags.mood.name,
      aspect: tags.aspect.name,
      infinitive: {
        known: infinitiveVerb.data.known,
        learning: infinitiveVerb.data.learning,
      },
      conjugations,
    },
    scope,
  };

  return [instruction];
}

const sortByPerformer = (a, b) => {
  const sumSortValues = (unit) =>
    unit.tags
      .filter((tag) => tag.traits.includes("ONTOLOGICAL"))
      .reduce((sum, tag) => {
        const { leaf, branch } = tag.data.ONTOLOGICAL;
        if (branch === "person") return sum + parseInt(leaf);
        if (branch === "number") return leaf === "sing" ? sum + 0 : sum + 10;
        return sum;
      }, 0);

  return sumSortValues(a) - sumSortValues(b);
};
