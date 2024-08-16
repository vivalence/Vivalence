import { handleMemory } from "./lib/memory.js";

export default async function ({ scope, gameType, response }, ctx) {
  console.log("USAGE OF OUTDATED /memory/update");
  console.log("migrate to /memory/update/unit or /memory/update/tag instead.");
  return await handleMemory({ scope, gameType, response }, ctx);
}
