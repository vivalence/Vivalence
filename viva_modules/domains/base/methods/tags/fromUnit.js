export default async function (body, ctx) {
  const { unit } = body;

  const { data, error } = await ctx.runtime.locals.supabase
    .from("_TagToUnit")
    .select(`*, tag: A (id, data, name, slug, traits)`)
    .eq("runtimeId", ctx.runtime.manifest.id)
    .eq("B", unit.id);

  if (error) throw error;

  const tags = data.map(({ tag }) => tag);
  return tags;
}
