import { deepMerge } from "@vivalence/shared";
import make from "./make.js";

export default async function from({ scope, mask, units }) {
  const instructions = [];
  for (const unit of units) {
    const instruction = make({ mask, unit });

    scope = deepMerge(scope, { unit: { id: unit.id } });

    if (unit.tags.initialized && unit.tags?.length > 0)
      scope.unit.tags = unit.tags.map((tag) => ({ id: tag.id }));

    instructions.push({ type: "GAME", instruction, scope });
  }

  return instructions;
}
