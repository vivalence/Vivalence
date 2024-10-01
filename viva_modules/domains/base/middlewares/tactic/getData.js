import { join } from "$std/path/mod.ts";
import { deepMerge, blacklist as Blacklist } from "@vivalence/shared";

export default async function getData(body, ctx) {
  let { tactic, relations = {}, masks = {}, scope, blacklist } = body;

  const user = await ctx.runtime.locals.getUser();
  scope.user = { id: user.id };

  blacklist = await Blacklist.fromQueue({ blacklist, scope }, ctx);

  if (!tactic) {
    let query = ctx.runtime.locals.supabase
      .from("Tactic")
      .select(`*`)
      .eq("runtimeId", ctx.runtime.manifest.id);

    const url = new URL(ctx.request.url).pathname.split("/");
    const slug = url[url.indexOf("t") + 1];

    if (slug) query = query.eq("slug", slug);
    else if (scope.tactic) {
      if (scope.tactic.id) query = query.eq("id", scope.tactic.id);
      else if (scope.tactic.slug) query = query.eq("slug", scope.tactic.slug);
    }

    let { data, error } = await query.single();
    if (error) throw error;
    tactic = data;
  }

  tactic = deepMerge(tactic, { masks, relations });

  scope.tactic = { id: tactic.id };

  return { tactic, scope, blacklist, language: ctx.runtime.statics.language };
}
