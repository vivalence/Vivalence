export default async function allRuntimes(input, ctx) {
  const user = await ctx.services.identity.getUser();

  const { data, error } = await ctx.services.supabase
    .from("Runtime")
    .select(
      `id,slug,name,installed,icon,
	corpora: Corpus(id,slug,name,installed,icon)`,
    )
    .eq("installed", true);
  if (error) throw error;

  return data;
}
