import Mustache from "mustache";
import fs from "node:fs";

export default async function provision(inputs, ctx) {
  const { tags, mask, blacklist, scope } = inputs;
  const { language } = ctx.runtime.statics;

  // // POST TENSE TAG //
  const [tenseTag] = await ctx.runtime.call("/tags/fromTagIds", {
    tagIds: [tags.tense.id],
    take: 1,
  });

  // // POST INFINITIVE UNIT //
  const [infinitiveVerb] = await ctx.runtime.call("/units/fromTagIds", {
    tagIds: [mask.tags.infinitive.id, tags.verb.id],
    take: 1,
  });

  // // POST CONJUGATION UNITS //
  const tagIds = [tags.verb.id, tags.tense.id, tags.mood.id];
  const conjugationUnits = await ctx.runtime.call("/units/fromTagIds", { tagIds });

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
    scope: { unit: { id: unit.id } },
  }));

  scope.tags = tagIds.map((id) => ({ id }));
  scope.units = conjugations.map(({ scope }) => scope.unit);

  const instruction = {
    type: "CONJUGATIONS",
    instruction: {
      tense: tenseTag.name,
      mood: tags.mood.name,
      infinitive: {
        known: infinitiveVerb.data.known,
        learning: infinitiveVerb.data.learning,
      },
      conjugations,
    },
    scope,
  };

  return instruction;
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
