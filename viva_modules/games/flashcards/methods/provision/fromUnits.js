import make from "./lib/make.js";

export default async function fromUnits(inputs, ctx) {
  const { gameId, mask, units } = inputs;

  const instructions = [];
  for (const unit of units) {
    const instruction = make({ mask, unit });

    const scope = { unit: { id: unit.id }, game: { id: gameId } };
    if (unit.tags && unit.tags.length > 0) {
      scope.unit.tags = unit.tags.map((tag) => ({ id: tag.id }));
    }

    instructions.push({ type: "FLASHCARDS", instruction, scope });
  }

  return instructions;
}
