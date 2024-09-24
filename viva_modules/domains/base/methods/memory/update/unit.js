import { handleMemory } from "../lib/memory.js";

export default async function ({ scope, gameType, response }, ctx) {
  delete scope.tag;
  return await handleMemory({ scope, gameType, response }, ctx);
}
