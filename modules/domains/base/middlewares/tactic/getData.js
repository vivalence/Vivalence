import { join } from "$std/path/mod.ts";
import { deepMerge, blacklist as Blacklist } from "@vivalence/shared";

export default async function getData(body, ctx) {
  let { relations = {}, masks = {}, scope, blacklist } = body;

  const { data, error, ...rest } = await ctx.runtime.locals.supabase
    .from("Tactic")
    .select(`*`)
    .eq("runtimeId", ctx.runtime.manifest.id)
    .eq("id", ctx.state.tactic.id)
    .single();

  if (error) throw error;

  let tactic = deepMerge(data, { masks, relations });
  scope.tactic = { id: tactic.id };

  const user = await ctx.runtime.locals.getUser();
  scope.user = { id: user.id };

  blacklist = await Blacklist.fromQueue({ blacklist, scope }, ctx);

  return { tactic, scope, blacklist, language: ctx.runtime.statics.language };
}
