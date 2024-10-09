import { handleMemory } from "../lib/memory.js";

export default async function ({ scope, gameType, response }, ctx) {
  return await handleMemory({ scope, gameType, response }, ctx);
}
