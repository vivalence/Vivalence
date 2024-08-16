import { handlePlay } from "../lib/play.js";

export default async function ({ scope, nextPlay, response }, ctx) {
  delete scope.unit;
  return await handlePlay({ scope, nextPlay, response }, ctx);
}
