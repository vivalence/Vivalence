import { join } from "$std/path/mod.ts";
import { deepMerge, blacklist as Blacklist } from "@vivalence/shared";

export default async function getGameData(input, ctx) {
  let { mask = {}, scope = {}, blacklist = {} } = input;

  const { data: game, error } = await ctx.runtime.locals.supabase
    .from("Game")
    .select(`id,mask`)
    .eq("runtimeId", ctx.runtime.manifest.id)
    .eq("id", ctx.state.game.id)
    .single();
  if (error) throw error;

  mask = deepMerge(game.mask, mask);

  const user = await ctx.runtime.locals.getUser();
  scope.user = { id: user.id };
  scope.game = { id: game.id };

  blacklist = await Blacklist.fromQueue({ blacklist, scope }, ctx);

  // console.log("{ ...input, mask, scope, blacklist, language: ctx.runtime.statics.language }", {
  // ...input, mask, scope, blacklist, language: ctx.runtime.statics.language,});

  return { ...input, mask, scope, blacklist, language: ctx.runtime.statics.language };
}
