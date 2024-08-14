export default async function (body, ctx) {
  const { tagIds = [], blacklist = [] } = body;

  const { data: tags, error } = await ctx.runtime.locals.supabase
    .from("Tag")
    .select("id, data, name, slug, traits")
    .in("id", tagIds)
    .not("id", "in", `(${blacklist.join(",")})`);

  if (error) throw error;
  return tags;
}
