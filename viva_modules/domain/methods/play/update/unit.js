import { handlePlay } from "../lib/play.js";

export default async function ({ scope, nextPlay, response }, ctx) {
  delete scope.tag;
  return await handlePlay({ scope, nextPlay, response }, ctx);
}
