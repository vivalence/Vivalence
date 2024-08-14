import { deepMerge } from "@vivalence/shared";
import make from "./lib/make.js";

export default async function fromUnits(inputs, ctx) {
  let { scope, mask, units } = inputs;

  const instructions = [];
  for (const unit of units) {
    const instruction = make({ mask, unit });

    scope = deepMerge(scope, { unit: { id: unit.id } });
    if (unit.tags && unit.tags.length > 0)
      scope.unit.tags = unit.tags.map((tag) => ({ id: tag.id }));

    instructions.push({ type: "FLASHCARDS", instruction, scope });
  }

  return instructions;
}
