import { handlePlay } from "./lib/play.js";

export default async function ({ scope, nextPlay, response }, ctx) {
  console.log("USAGE OF OUTDATED /memory/update");
  console.log("migrate to /memory/update/unit or /memory/update/tag instead.");
  return await handlePlay({ scope, nextPlay, response }, ctx);
}
