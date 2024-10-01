export default async function (body, ctx) {
  const { slug } = body;

  const { data, error } = await ctx.runtime.locals.supabase
    .from("Tag")
    .select("id, data, name, description, slug, traits, runtimeId")
    .eq("slug", slug)
    .eq("runtimeId", ctx.runtime.manifest.id)
    .single();

  if (error) throw error;
  return data;
}
