import { handleMemory } from "../lib/memory.js";

export default async function ({ scope, gameType, response }, ctx) {
  // delete scope.unit;
  return await handleMemory({ scope, gameType, response }, ctx);
}
