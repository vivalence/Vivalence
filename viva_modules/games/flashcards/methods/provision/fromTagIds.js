import make from "./lib/make.js";

export default async function fromTagIds(inputs, ctx) {
  const { gameId, tagIds, mask, blacklist, take } = inputs;

  const units = await ctx.runtime.call("units/fromTagIds", {
    gameId,
    tagIds,
    blacklist: blacklist.units,
    take: take || 5,
  });

  const instructions = [];
  for (const unit of units) {
    const instruction = make({ mask, unit });
    instructions.push({
      type: "FLASHCARDS",
      instruction,
      scope: {
        unit: { id: unit.id, tags: tagIds.map((tagId) => ({ id: tagId })) },
        game: { id: gameId },
      },
    });
  }

  return instructions;
}
