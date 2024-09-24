import { join } from "$std/path/mod.ts";
import lock from "./lib/lock.js";
import getData from "./lib/data.js";
import queueToBlacklist from "./lib/queueToBlacklist.js";

export default async function ({ scope, blacklist }, ctx) {
  const start = performance.now();
  const user = await ctx.runtime.locals.getUser();
  scope.user = { id: user.id };

  blacklist = await queueToBlacklist({ blacklist, scope }, ctx);

  const { tactic } = await getData({ scope }, ctx);

  const inputs = {
    language: { learning: "spanish", known: "english" },
    tactic,
    scope,
    blacklist,
  };

  const instructions = await ctx.runtime.call(join("/t", tactic.slug), inputs);

  const end = performance.now();
  console.log(`PROVISIONING ${instructions.length}  took ${(end - start) / 1000} seconds`);
  return instructions;
}
