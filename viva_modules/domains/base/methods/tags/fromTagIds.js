export default async function (body, ctx) {
  const { tagIds = [], blacklist = { tags: [] } } = body;

  const { data: tags, error } = await ctx.runtime.locals.supabase
    .from("Tag")
    .select("id, data, name, slug, traits")
    .eq("runtimeId", ctx.runtime.manifest.id)
    .in("id", tagIds)
    .not("id", "in", `(${blacklist.tags.join(",")})`);

  if (error) throw error;
  return tags;
}
