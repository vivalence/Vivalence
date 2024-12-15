export default async function (body, ctx) {
  const { slugs } = body;

  const { data, error } = await ctx.runtime.services.supabase
    .from("Tag")
    .select("id, data, name, description, slug, traits, runtimeId")
    .in("slug", slugs)
    .eq("runtimeId", ctx.runtime.manifest.id);

  if (error) throw error;
  return data;
}
