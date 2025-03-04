export default async function (body, ctx) {
  const { slug } = body;

  const { data, error } = await ctx.runtime.services.supabase
    .from("Unit")
    .select("*")
    .eq("slug", slug)
    .eq("runtimeId", ctx.runtime.manifest.id)
    .single();

  if (error) throw error;
  return data;
}
