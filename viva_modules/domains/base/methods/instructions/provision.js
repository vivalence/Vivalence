import { join } from "$std/path/mod.ts";
import { blacklist as Blacklist } from "@vivalence/shared";
import getData from "./lib/data.js";

export default async function ({ scope, blacklist }, ctx) {
  const start = performance.now();
  const user = await ctx.runtime.locals.getUser();
  scope.user = { id: user.id };

  blacklist = await Blacklist.fromQueue({ blacklist, scope }, ctx);

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
