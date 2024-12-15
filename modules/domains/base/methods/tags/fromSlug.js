export default async function (body, ctx) {
  const { slug } = body;

  const { data, error } = await ctx.runtime.services.supabase
    .from("Tag")
    .select("id, data, name, description, slug, traits, runtimeId")
    .eq("slug", slug)
    .eq("runtimeId", ctx.runtime.manifest.id)
    .maybeSingle();

  if (error) throw error;
  return data;
}
